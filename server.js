const express = require('express');
const app = express();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const port = 3001;

// Set up multer for file uploads (using disk storage for this example)
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

app.get("/", (req, res) => {
  res.json({ operation_code: 1 });
});

app.get("/bfhl", (req, res) => {
  res.json({ operation_code: 1 });
});

// POST /bfhl endpoint with flexible handling
app.post('/bfhl', upload.single('file'), (req, res) => {
  console.log('Received request body:', req.body);
  console.log('Received file:', req.file);

  let data;
  try {
    // Check if the request is multipart (from form) or direct JSON
    if (req.file || (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data'))) {
      // If it's multipart, parse the 'data' field
      data = JSON.parse(req.body.data);
    } else {
      // If it's direct JSON, use the body as is
      data = req.body;
    }
    console.log('Parsed data:', data);

    // Ensure data.data exists and is an array
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

  if (req.file) {
    fileInfo = {
      file_valid: true,
      file_mime_type: req.file.mimetype,
      file_size_kb: Math.round(req.file.size / 1024).toString(),
      file_name: req.file.originalname
    };
  }

  const response = {
    is_success: true,
    user_id: userId,
    email: "geethkrishna_p@srmap.edu.in",
    roll_number: "AP21110011504",
    numbers: numbers,
    alphabets: alphabets,
    highest_lowercase_alphabet: highestLowercaseAlphabet,
    ...fileInfo
  };

  console.log('Sending response:', response);

  // Send the response
  res.json(response);

  // Delete the file after response
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error('Failed to delete file:', err);
      } else {
        console.log('File deleted successfully');
      }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ is_success: false, message: 'Something went wrong!' });
});

// Start the server
app.listen(port, () => {
  //console.log(`Server listening at http://localhost:${port}`);
});
