'use client';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { loadDeepLabModel } from 'document-processing-cleaner';
import { useDocumentProcess } from 'document-processing-cleaner';
import { useOpenCVReady } from 'document-processing-cleaner';
import type { DeepLabModel } from 'document-processing-cleaner';

export default function Page() {
  const [model, setModel] = useState<DeepLabModel | null>(null);
  const isOpenCVReady = useOpenCVReady();
  const [image, setImage] = useState<string | null>(null);

  const {
    processImage,
    setOriginalImage,
    debugImages,
    processedImage,
    isProcessing,
    originalImage
  } = useDocumentProcess(model, isOpenCVReady);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (!acceptedFiles.length) return;

      const file = acceptedFiles[0];
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      });
      setImage(base64);
    }
  });

  useEffect(() => {
    if (originalImage) {
      processImage();
    }
  }, [originalImage]);

  const handleProcess = async () => {
    if (!image) return;
    setOriginalImage(image);
  };

  useEffect(() => {
    if (!isOpenCVReady) return;
    loadDeepLabModel().then(setModel);
  }, [isOpenCVReady]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {isDragActive ? (
            <p className="text-blue-500">Drop image here...</p>
          ) : (
            <>
              <p className="font-medium">Drag & drop an image here, or click to select</p>
              <p className="text-sm text-gray-500">Supports JPEG, JPG, PNG (single file only)</p>
            </>
          )}
        </div>
      </div>

      {image && (
        <div className="mt-6 flex flex-col items-center">
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
            <div className="flex-1 bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-center font-medium mb-2">Original Image</h3>
              <div className="border border-gray-200 rounded overflow-hidden h-64 flex items-center justify-center">
                <img
                  src={image}
                  alt="Original"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>

            {processedImage && (
              <div className="flex-1 bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-center font-medium mb-2">Processed Image</h3>
                <div className="border border-gray-200 rounded overflow-hidden h-64 flex items-center justify-center">
                  <img
                    src={processedImage}
                    alt="Processed"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="mt-3 flex justify-center">
                  <a
                    href={processedImage}
                    download="processed-image.png"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={handleProcess}
              disabled={!model || !isOpenCVReady || isProcessing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Process Image'
              )}
            </button>
          </div>

          {debugImages.length > 0 && (
            <div className="mt-6 w-full max-w-4xl">
              <h3 className="text-center font-medium mb-2">Debug Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {debugImages.map((debugImg, idx) => {
                  const [label, dataUrl] = debugImg.split('|');
                  return (
                    <div key={idx} className="flex flex-col items-center bg-white p-2 rounded shadow">
                      <img
                        src={dataUrl}
                        alt={`Debug ${idx}`}
                        className="h-24 object-contain border"
                      />
                      <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}