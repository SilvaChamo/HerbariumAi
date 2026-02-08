export const formatCurrency = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/\s/g, '')) : value;
    if (isNaN(num)) return value.toString();

    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

/**
 * Compresses an image and converts it to WebP format.
 * Ensures the file size is under the target size (default 100KB).
 */
export const compressImage = async (
    file: File | Blob,
    options: {
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
        targetSizeKb?: number;
    } = {}
): Promise<Blob> => {
    const {
        maxWidth = 1024,
        maxHeight = 1024,
        quality = 0.8,
        targetSizeKb = 100
    } = options;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Failed to get canvas context"));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                const attemptCompression = (q: number) => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error("Failed to create blob"));
                                return;
                            }

                            if (blob.size / 1024 <= targetSizeKb || q <= 0.1) {
                                resolve(blob);
                            } else {
                                // Reduce quality and try again
                                attemptCompression(q - 0.1);
                            }
                        },
                        'image/webp',
                        q
                    );
                };

                attemptCompression(quality);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};
