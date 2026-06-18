import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { client } from '../../lib/sanity';
import PageTransition from '../../components/PageTransition/PageTransition';
import './JournalPage.css';

const JournalPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await client.fetch(`
          *[_type == "journalPost" && isHidden != true] | order(publishedAt desc) {
            _id,
            title,
            "slug": slug.current,
            excerpt,
            publishedAt
          }
        `);
        setArticles(data || []);
      } catch (err) {
        console.error("Error fetching journal posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <PageTransition>
      <div className="journal-page">
        <header className="journal__header">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="journal__title"
          >
            Journal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="journal__subtitle"
          >
            Stories, musings, and insights from the world of tea.
          </motion.p>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '4rem', color: '#f5ebe0' }}>Loading journal...</div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '4rem', color: '#f5ebe0', fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Coming soon, stay tuned
          </div>
        ) : (
          <div className="journal__grid">
            {articles.map((article, index) => (
              <motion.article
                key={article._id}
                className="journal__card glass-panel"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <div className="journal__card-content">
                  <span className="journal__card-date">{new Date(article.publishedAt).toLocaleDateString()}</span>
                  <h2 className="journal__card-title">{article.title}</h2>
                  <p className="journal__card-excerpt">{article.excerpt}</p>
                  <Link to={`/journal/${article.slug}`} className="journal__card-link">
                    Read More <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default JournalPage;
