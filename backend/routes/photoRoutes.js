const express = require('express');
const router = express.Router();
const { upload } = require('../utils/cloudinary');
const Photo = require('../models/Photo');
const Album = require('../models/Album');
// const auth = require('../middleware/auth'); // TODO: Add Auth Middleware

// Upload Photos
router.post('/upload', upload.array('photos', 50), async (req, res) => {
    try {
        const { albumTitle, price, isPrivate, photographerId } = req.body;

        // 1. Find or Create Album
        // Ideally, photographerId comes from req.user.id (Auth Middleware)
        // For MVP, we might accept it from body or hardcode if testing
        let album = await Album.findOne({ title: albumTitle });

        if (!album) {
            album = new Album({
                title: albumTitle,
                photographerId: photographerId || "60d0fe4f5311236168a109ca", // Placeholder ID if not auth
                pricePerPhoto: price,
                isPrivate: isPrivate === 'true',
            });
            await album.save();
        }

        // 2. Process Files
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadedPhotos = [];

        for (const file of req.files) {
            // Cloudinary returns file.path as the secure_url
            const originalUrl = file.path;

            // Generate Watermarked URL (Cloudinary Transformation)
            // w_800,l_text:Arial_80:PREVIEW,o_50,a_45 ( Diagonal Text Overlay )
            // We can manipulate the URL string to insert transformations or use Cloudinary SDK

            // Simple string manipulation to add transformation before /upload/
            // standard url: https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg
            // transformed: https://res.cloudinary.com/demo/image/upload/l_text:Arial_80_bold:PREVIEW,g_center,o_50,a_-45/v1234/sample.jpg

            const splitUrl = originalUrl.split('/upload/');
            const watermarkedUrl = `${splitUrl[0]}/upload/l_text:Arial_80_bold:PREVIEW,g_center,o_50,a_-45,w_1000/${splitUrl[1]}`;

            const photo = new Photo({
                albumId: album._id,
                originalUrl: originalUrl,
                watermarkedUrl: watermarkedUrl,
                price: price, // inherit from album or override
                metadata: {
                    size: file.size
                }
            });

            await photo.save();
            uploadedPhotos.push(photo);
        }

        res.status(201).json({ message: 'Upload Successful', album, photos: uploadedPhotos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Get Photos by Album
router.get('/:albumId', async (req, res) => {
    try {
        const photos = await Photo.find({ albumId: req.params.albumId });
        // Return mostly watermarked URLs, unless purchased (logic to be added)
        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
