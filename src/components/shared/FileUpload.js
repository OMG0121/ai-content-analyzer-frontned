import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert,
  LinearProgress 
} from '@mui/material';
import { 
  isValidFileType, 
  isFileTooLarge, 
  formatFileSize 
} from '../../services/api';

const FileUpload = ({ 
  onFileSelect, 
  acceptedTypes, 
  maxSize,
  type = 'file' // 'video' or 'image'
}) => {
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Validate file type and size
    if (!isValidFileType(file, acceptedTypes)) {
      setError(`Invalid file type. Please upload: ${acceptedTypes.map(type => type.split('/')[1]).join(', ')}`);
      return;
    }
    
    if (isFileTooLarge(file, maxSize)) {
      setError(`File too large. Maximum size is ${formatFileSize(maxSize)}`);
      return;
    }

    setSelectedFile(file);
    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      await onFileSelect(file, (progress) => {
        setUploadProgress(progress);
      });
    } catch (err) {
      setError(err.message || 'Failed to process file');
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    // Reset input value
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <Box>
      <input
        type="file"
        onChange={handleInputChange}
        accept={acceptedTypes.join(',')}
        style={{ display: 'none' }}
        id="file-upload"
      />
      
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        sx={{
          border: '1px dashed #ccc',
          borderRadius: 1,
          p: 2,
          textAlign: 'center',
          bgcolor: '#fafafa',
          mb: 2
        }}
      >
        <Button
          variant="contained"
          component="label"
          htmlFor="file-upload"
          disabled={uploading}
        >
          Select {type === 'image' ? 'Image' : 'Video'}
        </Button>

        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
          or drag and drop here
        </Typography>

        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
          Maximum size: {formatFileSize(maxSize)}
        </Typography>
      </Box>

      {/* Selected File Info */}
      {selectedFile && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
        </Typography>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress} 
          />
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            {uploadProgress === 100 
              ? 'Processing...' 
              : `Uploading: ${uploadProgress}%`
            }
          </Typography>
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;