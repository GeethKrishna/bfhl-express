const express = require('express');
const app = express();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const port = 3001;

// Base64 decoding utilities
const mime = require('mime-types'); // For extracting MIME types from file extensions

// Set up multer for file uploads (using disk storage for file upload)
const upload = multer({ dest: 'uploads/' });

app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

const userId = "Geeth_Krishna_Potnuru_08062004"; // Hardcoded user_id

// Helper function to process the data
const processData = (inputData) => {
  const numbers = [];
  const alphabets = [];
  const lowercaseAlphabets = [];

  inputData.forEach(item => {
    if (!isNaN(item)) {
      numbers.push(item);
    } else if (/^[a-zA-Z]$/.test(item)) {
      alphabets.push(item);
      if (item === item.toLowerCase()) {
        lowercaseAlphabets.push(item);
      }
    }
  });
  const highestLowercaseAlphabet = lowercaseAlphabets.length > 0
    ? [lowercaseAlphabets.sort((a, b) => b.localeCompare(a))[0]]
    : [];

  return { numbers, alphabets, highestLowercaseAlphabet };
};

// Updated decodeBase64 function
const decodeBase64 = (b64string) => {
  const matches = b64string.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 string format");
  }

  const mimeType = matches[1]; // Extract MIME type
  const buffer = Buffer.from(matches[2], 'base64'); // Decode base64 content to a buffer
  const fileSizeKb = Math.round(buffer.length / 1024); // Calculate size in KB

  return { mimeType, fileSizeKb };
};

app.get("/", (req, res) => {
  res.json({ operation_code: 1 });
});

app.get("/bfhl", (req, res) => {
  res.json({ operation_code: 1 });
});

// POST /bfhl endpoint with flexible handling
app.post('/bfhl', upload.single('file'), (req, res) => {
  console.log('Received request body:', req.body);

  let data;
  try {
    if (req.file || (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data'))) {
      // If it's a multipart form, parse 'data' field
      data = JSON.parse(req.body.data);
    } else {
      // If direct JSON, use body as-is
      data = req.body;
    }

    // Ensure 'data' exists and is an array
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error("Invalid input format. 'data' should be an array.");
    }
  } catch (error) {
    console.error('Error parsing data:', error);
    return res.status(400).json({
      is_success: false,
      user_id: userId,
      message: error.message
    });
  }

  const { numbers, alphabets, highestLowercaseAlphabet } = processData(data.data);

  let fileInfo = {
    file_valid: false
  };

  // Handle actual file upload using multer
  if (req.file) {
    fileInfo = {
      file_valid: true,
      file_mime_type: req.file.mimetype,
      file_size_kb: Math.round(req.file.size / 1024).toString(),
      file_name: req.file.originalname
    };

    // Delete the file after processing
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error('Failed to delete file:', err);
      }
    });
  }

  // Handle base64 file input
  if (data.file_b64) {
    try {
      const { mimeType, fileSizeKb } = decodeBase64(data.file_b64);
      fileInfo = {
        file_valid: true,
        file_mime_type: mimeType,
        file_size_kb: fileSizeKb.toString(),
        file_name: 'file_b64'
      };
    } catch (error) {
      console.error('Error decoding base64:', error);
      return res.status(400).json({
        is_success: false,
        user_id: userId,
        message: error.message
      });
    }
  }

  const response = {
    is_success: true,
    user_id: "john_doe_17091999", // Hardcoded for example
    email: "john@xyz.com",
    roll_number: "ABCD123",
    numbers: numbers,
    alphabets: alphabets,
    highest_lowercase_alphabet: highestLowercaseAlphabet,
    ...fileInfo
  };

  console.log('Sending response:', response);
  res.json(response);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ is_success: false, message: 'Something went wrong!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
