import { Edit, Hash, Loader2, Sparkles } from 'lucide-react';
import React, { useState } from 'react'
import axios from 'axios';
import { useAuth } from '@clerk/react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const BlogTitles = () => {

  const { getToken } = useAuth();

    const blogCategories = [
      'General', 'Technology','Business', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food'
    ]
  
    const [selectedCategory, setSelectedCategory] = useState('General');
    const [input, setInput] = useState('');

    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
  
    const onSubmitHandler = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      try {

        const prompt = `Generate 5 engaging and creative blog titles based on the following keyword:

        Keyword: "${input}"
        Category: ${selectedCategory}
        
        The titles should be:
        - Catchy and attention-grabbing
        - Relevant to the keyword and category
        - Optimized for SEO
        - Varied in style (questions, statements, listicles, etc.)
        - Suitable for a blog audience
        
        Return only the blog titles, one per line, format as a markdown list.
        
        Generate the 5 blog titles now:`

        const { data } = await axios.post('/api/ai/generate-blog-title', {
          prompt
        }, { headers: { Authorization: `Bearer ${await getToken()}` } });

        if (data.success) {
          setContent(data.content);
          toast.success(data.message);
        }

      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        setLoading(false);
      }
    }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      {/* Left col */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>AI Title Generator</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Keyword</p>
        <input type="text" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='The future of artificial intelligence is...' required value={input} onChange={(e) => setInput(e.target.value)} />

        <p className='mt-4 text-sm font-medium'>Blog Category</p>
        <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
          {blogCategories.map((item, index) => (
            <span onClick={() => setSelectedCategory(item)}
              className={`text-xs px-4 py-1 border border-gray-300 rounded-full cursor-pointer ${selectedCategory === item ? 'bg-linear-to-br from-[#8E37EB] to-[#C77DFF] text-white' : ''}`}
              key={index}>
              {item}
            </span>
          ))}
        </div>
        <br />
        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-linear-to-r from-[#8E37EB] to-[#C77DFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50'>
          {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : <Hash className='w-4 h-4' />}
          Generate Title
        </button>
      </form>

      {/* Right Col  */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3'>
          <Hash className='w-5 h-5 text-[#8E37EB]' />
          <p className='text-xl font-semibold'>Generated Titles</p>
        </div>

        {!content ? (
          <div className='flex-1 flex justify-center items-center h-full '>
          <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
            <Hash className='w-9 h-9' />
            <p>Enter a topic and click "Generate title" to get started</p>
          </div>
        </div>
        ) : (
          <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600'>
            <div className='reset-tw'>
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogTitles