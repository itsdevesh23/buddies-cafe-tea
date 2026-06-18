import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { client } from '../../lib/sanity';
import PageTransition from '../../components/PageTransition/PageTransition';
import './JournalPage.css';

const ArticlePage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await client.fetch(`
          *[_type == "journalPost" && slug.current == $slug][0] {
            _id,
            title,
            "slug": slug.current,
            content,
            publishedAt
          }
        `, { slug });
        setPost(data);
      } catch (err) {
        console.error("Error fetching article:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <PageTransition>
        <div className="journal-page" style={{ textAlign: 'center', paddingTop: '10rem', color: '#f5ebe0' }}>
          Loading article...
        </div>
      </PageTransition>
    );
  }

  if (!post) {
    return (
      <PageTransition>
        <div className="journal-page" style={{ textAlign: 'center', paddingTop: '10rem', color: '#f5ebe0' }}>
          <h1>Article not found.</h1>
          <Link to="/journal" style={{ color: '#4ade80', textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>
            <ArrowLeft size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Back to Journal
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="journal-page" style={{ paddingBottom: '5rem', minHeight: '100vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '8rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <Link to="/journal" style={{ color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#4ade80'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
            <ArrowLeft size={16} /> Back to Journal
          </Link>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ fontSize: '3rem', color: '#f8fafc', marginBottom: '1rem', lineHeight: '1.2' }}
          >
            {post.title}
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ color: '#4ade80', marginBottom: '3rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            {new Date(post.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            style={{ color: '#e2e8f0', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}
          >
            {post.content}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ArticlePage;
