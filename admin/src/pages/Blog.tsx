import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ImageCropperWithUpload from '../components/ImageCropperWithUpload';
import { IMAGE_CONFIGS } from '../config/imageConfig';
import RichTextEditor from '../components/RichTextEditor';
import './Blog.css';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  author: number;
  author_name: string;
  meta_title: string;
  meta_description: string;
  status: 'draft' | 'published';
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  meta_title: string;
  meta_description: string;
  status: 'draft' | 'published';
  is_featured: boolean;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    meta_title: '',
    meta_description: '',
    status: 'draft',
    is_featured: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [filterStatus, searchTerm]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await apiClient.get('/blog/', { params });
      const data = extractData(response.data);
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
      alert('Failed to load blog posts');
      setPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      featured_image_url: '',
      meta_title: '',
      meta_description: '',
      status: 'draft',
      is_featured: false,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      featured_image_url: post.featured_image_url,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      status: post.status,
      is_featured: post.is_featured,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/blog/${post.id}/delete/`);
      alert('Blog post deleted successfully');
      fetchPosts();
    } catch (error) {
      console.error('Failed to delete blog post:', error);
      alert('Failed to delete blog post');
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const action = newStatus === 'published' ? 'publish' : 'unpublish';
    
    if (!window.confirm(`Are you sure you want to ${action} "${post.title}"?`)) {
      return;
    }

    try {
      await apiClient.patch(`/blog/${post.id}/update/`, { status: newStatus });
      alert(`Blog post ${action}ed successfully`);
      fetchPosts();
    } catch (error) {
      console.error(`Failed to ${action} blog post:`, error);
      alert(`Failed to ${action} blog post`);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.content.trim() || formData.content === '<p><br></p>') {
      errors.content = 'Content is required';
    }

    if (!formData.excerpt.trim()) {
      errors.excerpt = 'Excerpt is required';
    }

    if (!formData.featured_image_url.trim()) {
      errors.featured_image_url = 'Featured image is required';
    }

    if (!formData.meta_title.trim()) {
      errors.meta_title = 'Meta title is required';
    } else if (formData.meta_title.length > 60) {
      errors.meta_title = 'Meta title should be 60 characters or less';
    }

    if (!formData.meta_description.trim()) {
      errors.meta_description = 'Meta description is required';
    } else if (formData.meta_description.length > 160) {
      errors.meta_description = 'Meta description should be 160 characters or less';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      if (editingPost) {
        await apiClient.put(`/blog/${editingPost.id}/update/`, formData);
        alert('Blog post updated successfully');
      } else {
        await apiClient.post('/blog/create/', formData);
        alert('Blog post created successfully');
      }
      setIsModalOpen(false);
      fetchPosts();
    } catch (error: any) {
      console.error('Failed to save blog post:', error);
      if (error.response?.data?.error?.details) {
        setFormErrors(error.response.data.error.details);
      } else if (error.response?.data) {
        setFormErrors(error.response.data);
      } else {
        alert('Failed to save blog post');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'featured_image_url',
      label: 'Image',
      render: (item: BlogPost) => (
        <img
          src={item.featured_image_url}
          alt={item.title}
          className="blog-thumbnail"
        />
      ),
    },
    { key: 'title', label: 'Title' },
    { key: 'author_name', label: 'Author' },
    {
      key: 'status',
      label: 'Status',
      render: (item: BlogPost) => (
        <span className={`status-badge ${item.status}`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      ),
    },
    {
      key: 'is_featured',
      label: 'Featured',
      render: (item: BlogPost) => (
        <span className={`status-badge ${item.is_featured ? 'published' : 'draft'}`}>
          {item.is_featured ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'published_at',
      label: 'Published',
      render: (item: BlogPost) =>
        item.published_at
          ? new Date(item.published_at).toLocaleDateString()
          : '-',
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (item: BlogPost) => new Date(item.created_at).toLocaleDateString(),
    },
  ];

  const customActions = (item: BlogPost) => (
    <button
      onClick={() => handleTogglePublish(item)}
      className={`btn-action ${item.status === 'published' ? 'btn-unpublish' : 'btn-publish'}`}
      title={item.status === 'published' ? 'Unpublish' : 'Publish'}
    >
      {item.status === 'published' ? 'Unpublish' : 'Publish'}
    </button>
  );

  return (
    <div className="blog-page">
      <div className="page-header">
        <h1>Blog Management</h1>
        <button className="btn-primary" onClick={handleAdd}>
          Add Blog Post
        </button>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search blog posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Posts</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={posts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No blog posts found. Create your first post!"
        customActions={customActions}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPost ? 'Edit Blog Post' : 'Add Blog Post'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="blog-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={formErrors.title ? 'error' : ''}
              placeholder="Enter blog post title"
            />
            {formErrors.title && <span className="error-message">{formErrors.title}</span>}
          </div>

          <div className="form-group">
            <RichTextEditor
              label="Content *"
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              error={formErrors.content}
              placeholder="Write your blog post content here..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Excerpt *</label>
            <textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className={formErrors.excerpt ? 'error' : ''}
              placeholder="Brief summary of the blog post"
            />
            {formErrors.excerpt && <span className="error-message">{formErrors.excerpt}</span>}
          </div>

          <div className="form-group">
            <ImageCropperWithUpload
              label="Featured Image *"
              value={formData.featured_image_url}
              onChange={(url) => setFormData({ ...formData, featured_image_url: url })}
              error={formErrors.featured_image_url}
              aspectRatio={IMAGE_CONFIGS.blog.aspectRatio}
            />
          </div>

          <div className="seo-section">
            <h3>SEO Settings</h3>
            
            <div className="form-group">
              <label htmlFor="meta_title">
                Meta Title * <span className="char-count">({formData.meta_title.length}/60)</span>
              </label>
              <input
                type="text"
                id="meta_title"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                className={formErrors.meta_title ? 'error' : ''}
                placeholder="SEO title for search engines"
                maxLength={60}
              />
              {formErrors.meta_title && (
                <span className="error-message">{formErrors.meta_title}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="meta_description">
                Meta Description * <span className="char-count">({formData.meta_description.length}/160)</span>
              </label>
              <textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                rows={3}
                className={formErrors.meta_description ? 'error' : ''}
                placeholder="SEO description for search engines"
                maxLength={160}
              />
              {formErrors.meta_description && (
                <span className="error-message">{formErrors.meta_description}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              />
              <span>Featured on Homepage</span>
            </label>
            <small className="form-hint">Featured blog posts will appear in the homepage blog section</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingPost ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Blog;
