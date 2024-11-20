import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FileUpload from '../shared/FileUpload';
import { analyzeImage } from '../../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
}));

const ImagePreview = styled('img')({
  maxWidth: '100%',
  maxHeight: '500px',
  objectFit: 'contain',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
});

const ImageAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleFileSelect = async (file) => {
    setLoading(true);
    setError('');
    setResult(null);
    setUploadProgress(0);

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setSelectedImage(previewUrl);

      const data = await analyzeImage(file, (progress) => {
        setUploadProgress(progress);
      });

      setResult(data);
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup preview URL when component unmounts or when selectedImage changes
  React.useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Image Analysis
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Upload an image to get a detailed human-like description of its content.
        </Typography>
        
        <FileUpload 
          onFileSelect={handleFileSelect}
          acceptedTypes={['image/jpeg', 'image/png', 'image/gif']}
          maxSize={20971520} // 20MB
          type="image"
        />
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            {uploadProgress === 100 
              ? 'Analyzing image content...' 
              : `Uploading: ${uploadProgress}%`}
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      {(selectedImage || result) && !loading && (
        <StyledCard>
          <CardContent>
            <Grid container spacing={4}>
              {selectedImage && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'background.paper', 
                    borderRadius: 1,
                    boxShadow: 1
                  }}>
                    <ImagePreview src={selectedImage} alt="Uploaded content" />
                  </Box>
                </Grid>
              )}
              
              {result && (
                <Grid item xs={12} md={selectedImage ? 6 : 12}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Image Analysis
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-line',
                      lineHeight: 1.8,
                      bgcolor: 'background.paper',
                      p: 2,
                      borderRadius: 1,
                      boxShadow: 1
                    }}
                  >
                    {result.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </StyledCard>
      )}
    </Box>
  );
};

export default ImageAnalyzer;