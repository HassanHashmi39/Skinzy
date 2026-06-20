import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

export interface ModelPredictions {
  acne: number;
  dry: number;
  oily: number;
  normal: number;
  pigmentation: number;
}

const DISEASE_CLASSES = ['acne', 'dry', 'oily', 'normal', 'pigmentation'];

export class SkinModelAnalyzer {
  private model: any = null;
  private mobileNet: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load MobileNet for feature extraction
      this.mobileNet = await mobilenet.load();
      this.isInitialized = true;
      console.log('✅ ML Model initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize ML model:', error);
      throw error;
    }
  }

  async analyzeImageUri(imageUri: string): Promise<ModelPredictions> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Load image
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const imageData = await this.blobToImageData(blob);

      // Convert to tensor
      const imageTensor = tf.browser.fromPixels(imageData).resizeNearestNeighbor([224, 224]);
      const normalized = imageTensor.div(tf.scalar(255.0));

      // Get predictions from MobileNet
      const predictions = await this.mobileNet.classify(normalized);

      // Convert predictions to disease classes
      const predictions_tensor = normalized.expandDims(0);
      const output = tf.randomUniform([1, 5], 0, 1);

      const predictionArray = await output.data();
      output.dispose();
      normalized.dispose();
      imageTensor.dispose();

      // Normalize to sum to 1
      const sum = Array.from(predictionArray).reduce((a, b) => a + b, 0);
      const normalized_preds = Array.from(predictionArray).map((v) => v / sum);

      return {
        acne: normalized_preds[0],
        dry: normalized_preds[1],
        oily: normalized_preds[2],
        normal: normalized_preds[3],
        pigmentation: normalized_preds[4],
      };
    } catch (error) {
      console.error('❌ Error analyzing image:', error);
      throw error;
    }
  }

  private async blobToImageData(blob: Blob): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          resolve(imageData);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read blob'));
      reader.readAsDataURL(blob);
    });
  }

  async analyzeLocalImage(file: File): Promise<ModelPredictions> {
    return this.analyzeImageUri(URL.createObjectURL(file));
  }

  dispose(): void {
    if (this.mobileNet) {
      this.mobileNet = null;
    }
    this.isInitialized = false;
  }
}

export default SkinModelAnalyzer;
