import express from 'express'
import 'dotenv/config'
import { connectToMongoDB } from './database/connection.js'
import posts from './models/posts.js'

const app = express()

connectToMongoDB()

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World')
})

// 1. Get all posts
app.get('/posts', async (req, res) => {
    try {
        const [data, total] = await Promise.all([
            posts.find(), // Fetch all posts
            posts.countDocuments() // Get total count of posts
        ]);
        res.status(200).json({
            posts: data,
            totalCount: total,
            message: 'All posts fetched successfully',
            success: true,
        });
    } catch (error) {
        console.log(error, "err")
        res.status(500).json({ message: 'Error fetching posts', success: false, error });
    }
});

// 2. Get a single post by ID
app.get('/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const post = await posts.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found', success: false });
        }
        res.status(200).json({ post, message: 'Post fetched successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post', success: false, error });
    }
});

// 3. Create a new post
// payload example
// {
//     "title":"title",
//     "content":"content",
//     "author":"xyz"
// }
app.post('/posts', async (req, res) => {
    try {
        const { title, content, author, tags } = req.body;
        if (!title || !content || !author) {
            return res.status(422).json({ message: 'Title, content, and author are required', success: false });
        }

        const newPost = new posts({ title, content, author, tags });
        const savedPost = await newPost.save();
        res.status(201).json({ post: savedPost, message: 'Post created successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', success: false, error });
    }
});

// Delete a post by ID
app.delete('/posts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deletedPost = await posts.findByIdAndDelete(id);
  
      if (!deletedPost) {
        return res.status(404).json({
          message: 'Post not found',
          success: false,
        });
      }
  
      res.status(200).json({
        message: 'Post deleted successfully',
        success: true,
        deletedPost,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error deleting post',
        success: false,
        error,
      });
    }
  });
  

app.listen(8000, () => {
    console.log('Server is running on port 8000')
})