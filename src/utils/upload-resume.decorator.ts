import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

/** Sets limit for file size -  5MB.
 *  Allows only pdf and docx files
 */
export function UploadResume() {
  return UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error('Unsupported file type. Only PDF and DOCX are allowed.'),
            false,
          );
        }
      },
    }),
  );
}
