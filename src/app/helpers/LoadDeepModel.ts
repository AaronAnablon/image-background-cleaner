// utils/loadDeepLabModel.ts
import * as tf from '@tensorflow/tfjs';
import * as deeplab from '@tensorflow-models/deeplab';
import type { SemanticSegmentation } from '@tensorflow-models/deeplab';

async function loadDeepLabModel(): Promise<deeplab.SemanticSegmentation> {
    await tf.ready();
    return deeplab.load({
        base: 'pascal',
        quantizationBytes: 2,
    });
}

export type DeepLabModel = SemanticSegmentation | null;

export {
    loadDeepLabModel,
};
