import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Button,
} from '@mui/material';
import FileUpload from '../shared/FileUpload';
import { analyzeVideo, FILE_TYPES } from '../../services/api';

const VideoAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisType, setAnalysisType] = useState('detailed');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setError('');
    setResult(null);
  };

  const handleAnalysis = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');
    setResult(null);
    setUploadProgress(0);

    try {
      const data = await analyzeVideo(selectedFile, (progress) => {
        setUploadProgress(progress);
      }, analysisType);

      setResult(data.output);
    } catch (err) {
      console.error('Error during analysis:', err);
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Upload Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Video Analysis
        </Typography>
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Upload a video for detailed analysis
        </Typography>
        
        <FileUpload 
          onFileSelect={handleFileSelect}
          acceptedTypes={FILE_TYPES.VIDEO.types}
          maxSize={FILE_TYPES.VIDEO.maxSize}
          type="video"
        />

        {/* Analysis Type Selection */}
        {selectedFile && !loading && !result && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Select Analysis Type:
            </Typography>
            <ToggleButtonGroup
              value={analysisType}
              exclusive
              onChange={(e, newValue) => setAnalysisType(newValue || analysisType)}
              sx={{ mb: 2 }}
            >
              <ToggleButton value="detailed" sx={{ px: 3 }}>
                Detailed Analysis
              </ToggleButton>
              <ToggleButton value="overview" sx={{ px: 3 }}>
                Short Overview
              </ToggleButton>
              <ToggleButton value="interaction_tracking" sx={{ px: 3 }}>
                User Interactions
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="contained"
              onClick={handleAnalysis}
              fullWidth
              sx={{ mt: 1 }}
            >
              Start Analysis
            </Button>
          </Box>
        )}
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ textAlign: 'center', my: 2 }}>
          <CircularProgress size={30} />
          <Typography sx={{ mt: 1 }}>
            {uploadProgress === 100 
              ? 'Analyzing video content...' 
              : `Uploading: ${uploadProgress}%`}
          </Typography>
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {result && !loading && (
        <Paper sx={{ p: 2, mt: 2 }}>
          {/* Display sections with proper formatting */}
          {result.split('\n\n').map((section, index) => {
            // Check if section is a header
            const isHeader = section.toLowerCase().trim() === 'timeline:' || 
                           section.toLowerCase().trim() === 'summary:';

            return (
              <Box key={index} sx={{ mb: isHeader ? 1 : 3 }}>
                <Typography
                  variant={isHeader ? "h6" : "body1"}
                  component={isHeader ? "h2" : "p"}
                  sx={{
                    fontWeight: isHeader ? 600 : 400,
                    color: isHeader ? 'primary.main' : 'text.primary',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.6,
                    marginBottom: isHeader ? 2 : 0
                  }}
                >
                  {section}
                </Typography>
              </Box>
            );
          })}
        </Paper>
      )}
    </Box>
  );
};

export default VideoAnalyzer;