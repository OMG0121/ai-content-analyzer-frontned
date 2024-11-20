import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000, // 10 minutes
});

// Video Analysis
export const analyzeVideo = async (file, onProgress, analysisType = 'detailed') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('analysis_type', analysisType);
  
  // Enhanced timeout calculation based on file size and estimated duration
  const fileSizeInMB = file.size / (1024 * 1024);
  const baseTimeout = 30 * 60 * 1000; // 30 minutes base
  const timeoutPerGB = 60 * 60 * 1000; // 1 hour per GB
  const timeoutPerHour = 30 * 60 * 1000; // 30 minutes per estimated hour
  
  // Estimate video duration (rough estimation: 1 minute ≈ 100MB for HD video)
  const estimatedDurationHours = (fileSizeInMB / 100) / 60;
  
  // Calculate total timeout
  let timeout = baseTimeout;
  timeout += (fileSizeInMB / 1024) * timeoutPerGB; // Add time based on size in GB
  timeout += estimatedDurationHours * timeoutPerHour; // Add time based on duration
  
  // Cap at 2 hours maximum
  timeout = Math.min(timeout, 2 * 60 * 60 * 1000);

  try {
    const response = await api.post('/video/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (onProgress) {
          onProgress(percentCompleted);
        }
      },
      timeout: timeout,
    });

    return response.data;
  } catch (error) {
    console.error('Video analysis error:', error);
    let errorMessage = 'Failed to analyze video. ';
    
    if (error.response?.status === 429) {
      errorMessage += 'The service is currently experiencing high demand. Please wait a few minutes and try again.';
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      const timeoutMinutes = Math.round(timeout / 1000 / 60);
      errorMessage += `Analysis is taking longer than expected (${timeoutMinutes} minutes). `;
      if (fileSizeInMB > 200) {
        errorMessage += 'For large videos, try using the overview analysis type for faster processing.';
      } else {
        errorMessage += 'Please try again or use a shorter video.';
      }
    } else if (error.response?.status === 413) {
      errorMessage += 'File size exceeds 5GB limit.';
    } else if (error.response?.data?.detail) {
      errorMessage += error.response.data.detail;
    } else {
      errorMessage += 'Please try again or use the overview analysis type for faster processing.';
    }
    
    throw new Error(errorMessage);
  }
};

// Image Analysis
export const analyzeImage = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/image/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (onProgress) {
          onProgress(percentCompleted);
        }
      },
      timeout: 120000, // 2 minutes
    });

    if (!response.data) {
      throw new Error('No response received from server');
    }

    return {
      description: response.data.description || "No description available",
      technical_details: response.data.technical_details || {},
      objects: response.data.objects || [],
      text: response.data.text || []
    };
  } catch (error) {
    console.error('Image analysis error:', error);
    throw new Error(
      error.response?.data?.detail || 
      'Failed to analyze image. Please try again.'
    );
  }
};

// File validation utilities
export const isValidFileType = (file, acceptedTypes) => {
  if (!file || !acceptedTypes) return false;
  return acceptedTypes.includes(file.type);
};

export const isFileTooLarge = (file, maxSize) => {
  if (!file) return false;
  return file.size > maxSize;
};

// File type constants
export const FILE_TYPES = {
  VIDEO: {
    types: ['video/mp4', 'video/quicktime', 'video/webm', 'video/avi'],
    maxSize: 5368709120, // 5GB
    extensions: ['mp4', 'mov', 'webm', 'avi']
  },
  IMAGE: {
    types: ['image/jpeg', 'image/png', 'image/gif'],
    maxSize: 20971520, // 20MB
    extensions: ['jpg', 'jpeg', 'png', 'gif']
  }
};

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Error handling utility
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error
    return error.response.data.detail || error.response.data.message || 'Server error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.';
  } else {
    // Error setting up request
    return 'Failed to make request. Please try again.';
  }
};

export default api;