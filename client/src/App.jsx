import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './pages/Layout'
import Home from './pages/Home'
import BlogTitles from './pages/BlogTitles'
import Community from './pages/Community'
import Dashboard from './pages/Dashboard'
import GenerateImages from './pages/GenerateImages'
import RemoveBackground from './pages/RemoveBackground'
import RemoveObject from './pages/RemoveObject'
import ReviewResume from './pages/ReviewResume'
import WriteArticle from './pages/WriteArticle'
import { useAuth } from '@clerk/react'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

const App = () => {

 

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/ai' element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="blog-titles" element={<BlogTitles />} />
          <Route path="community" element={<Community />} />
          <Route path="generate-images" element={<GenerateImages />} />
          <Route path="remove-background" element={<RemoveBackground />} />
          <Route path="remove-object" element={<RemoveObject />} />
          <Route path="review-resume" element={<ReviewResume />} />
          <Route path="write-article" element={<WriteArticle />} />
        </Route>
      </Routes>
    </>
  )
}

export default App