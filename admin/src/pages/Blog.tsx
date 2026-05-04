import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import ImageCropperWithUpload from '../components/ImageCropperWithUpload';
import { IMAGE_CONFIGS } from '../config/imageConfig';
import RichTextEditor from '../components/RichTextEditor';
import './Blog.css';

interface BlogPost {
  id: number; title: string; slug: string; content: string; excerpt: string;
  featured_image_url: string; author: number; author_name: string;
  meta_title: string; meta_description: string;
  status: 'draft' | 'published'; is_featured: boolean;
  published_at: string | null; created_at: string; updated_at: string;
}
interface BlogFormData {
  title: string; content: string; excerpt: string; featured_image_url: string;
  meta_title: string; meta_description: string;
  status: 'draft' | 'published'; is_featured: boolean;
}

const EMPTY_FORM: BlogFormData = {
  title: '', content: '', excerpt: '', featured_image_url: '',
  meta_title: '', meta_description: '', status: 'draft', is_featured: false,
};

const Toggle = ({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) => (
  <div className="blog-toggle-row">
    <div className="blog-toggle-info">
      <span className="blog-toggle-label">{label}</span>
      {desc && <span className="blog-toggle-desc">{desc}</span>}
    </div>
    <label className="blog-toggle">
      <input type="checkbox" className="blog-toggle-input" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="blog-toggle-slider" />
    </label>
  </div>
);

const Blog = () => {
  const [posts, setPosts]           = useState<BlogPost[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode]     = useState<'grid' | 'list'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData]     = useState<BlogFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<'content' | 'seo' | 'settings'>('content');

  useEffect(() => { fetchPosts(); }, [filterStatus, searchTerm]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;
      const r = await apiClient.get('/blog/', { params });
      const data = extractData(r.data) as BlogPost[];
      setPosts(Array.isArray(data) ? data : []);
    } catch { alert('Failed to load blog posts'); setPosts([]); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditingPost(null); setFormData(EMPTY_FORM);
    setFormErrors({}); setActiveSection('content'); setIsModalOpen(true);
  };
  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({ title: post.title, content: post.content, excerpt: post.excerpt,
      featured_image_url: post.featured_image_url, meta_title: post.meta_title,
      meta_description: post.meta_description, status: post.status, is_featured: post.is_featured });
    setFormErrors({}); setActiveSection('content'); setIsModalOpen(true);
  };
  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    try { await apiClient.delete(`/blog/${post.id}/delete/`); fetchPosts(); }
    catch { alert('Failed to delete post'); }
  };
  const togglePublish = async (post: BlogPost) => {
    const ns = post.status === 'published' ? 'draft' : 'published';
    if (!window.confirm(`${ns === 'published' ? 'Publish' : 'Unpublish'} "${post.title}"?`)) return;
    try { await apiClient.patch(`/blog/${post.id}/update/`, { status: ns }); fetchPosts(); }
    catch { alert('Failed to update status'); }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    if (!formData.content.trim() || formData.content === '<p><br></p>') e.content = 'Content is required';
    if (!formData.excerpt.trim()) e.excerpt = 'Excerpt is required';
    if (!formData.featured_image_url.trim()) e.featured_image_url = 'Featured image is required';
    if (!formData.meta_title.trim()) e.meta_title = 'Meta title is required';
    else if (formData.meta_title.length > 60) e.meta_title = 'Max 60 characters';
    if (!formData.meta_description.trim()) e.meta_description = 'Meta description is required';
    else if (formData.meta_description.length > 160) e.meta_description = 'Max 160 characters';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editingPost) await apiClient.put(`/blog/${editingPost.id}/update/`, formData);
      else await apiClient.post('/blog/create/', formData);
      setIsModalOpen(false); fetchPosts();
    } catch (err: any) {
      if (err.response?.data?.error?.details) setFormErrors(err.response.data.error.details);
      else if (err.response?.data) setFormErrors(err.response.data);
      else alert('Failed to save post');
    } finally { setSubmitting(false); }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const published = posts.filter(p => p.status === 'published').length;
  const drafts = posts.filter(p => p.status === 'draft').length;
  const featured = posts.filter(p => p.is_featured).length;

  return (
    <div className="blog-page animate-fadeIn">

      {/* Header */}
      <div className="blog-header">
        <div className="blog-header-left">
          <h1 className="blog-title">Blog</h1>
          <div className="blog-stats">
            <span className="blog-stat"><span className="blog-stat-num">{posts.length}</span> total</span>
            <span className="blog-stat-sep">·</span>
            <span className="blog-stat blog-stat-pub"><span className="blog-stat-num">{published}</span> published</span>
            <span className="blog-stat-sep">·</span>
            <span className="blog-stat blog-stat-draft"><span className="blog-stat-num">{drafts}</span> drafts</span>
            <span className="blog-stat-sep">·</span>
            <span className="blog-stat blog-stat-feat"><span className="blog-stat-num">{featured}</span> featured</span>
          </div>
        </div>
        <div className="blog-header-actions">
          <div className="blog-view-toggle">
            <button className={`blog-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
            <button className={`blog-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
          </div>
          <button className="blog-btn-add" onClick={openAdd}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Post
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="blog-filters">
        <div className="blog-search-wrap">
          <svg className="blog-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="blog-search" type="text" placeholder="Search posts…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="blog-filter-tabs">
          {[['all','All'],['published','Published'],['draft','Drafts']].map(([v,l]) => (
            <button key={v} className={`blog-filter-tab ${filterStatus === v ? 'active' : ''}`}
              onClick={() => setFilterStatus(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="blog-loading"><div className="blog-spinner" /><span>Loading posts…</span></div>
      ) : posts.length === 0 ? (
        <div className="blog-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
          <p>No posts found</p>
          <button className="blog-btn-add" onClick={openAdd}>Write first post</button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="blog-grid">
          {posts.map(post => (
            <div key={post.id} className="blog-card">
              <div className="blog-card-img-wrap">
                {post.featured_image_url
                  ? <img src={post.featured_image_url} alt={post.title} className="blog-card-img" />
                  : <div className="blog-card-img-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                }
                <div className="blog-card-overlay">
                  <button className="blog-card-btn-edit" onClick={() => openEdit(post)}>Edit</button>
                  <button className="blog-card-btn-pub" onClick={() => togglePublish(post)}>
                    {post.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button className="blog-card-btn-del" onClick={() => handleDelete(post)}>Delete</button>
                </div>
                <div className="blog-card-badges">
                  <span className={`blog-badge blog-badge-${post.status}`}>{post.status}</span>
                  {post.is_featured && <span className="blog-badge blog-badge-featured">Featured</span>}
                </div>
              </div>
              <div className="blog-card-body">
                <div className="blog-card-title">{post.title}</div>
                <div className="blog-card-meta">
                  <span>{post.author_name}</span>
                  <span>·</span>
                  <span>{fmt(post.created_at)}</span>
                </div>
                {post.excerpt && <div className="blog-card-excerpt">{post.excerpt}</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="blog-list">
          <div className="blog-list-header">
            <span>Post</span><span>Author</span><span>Status</span><span>Date</span><span>Actions</span>
          </div>
          {posts.map(post => (
            <div key={post.id} className="blog-list-row">
              <div className="blog-list-post">
                {post.featured_image_url
                  ? <img src={post.featured_image_url} alt={post.title} className="blog-list-img" />
                  : <div className="blog-list-img-placeholder">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                }
                <div>
                  <div className="blog-list-title">{post.title}</div>
                  {post.is_featured && <span className="blog-badge blog-badge-featured" style={{marginTop:'4px',display:'inline-block'}}>Featured</span>}
                </div>
              </div>
              <div className="blog-list-author">{post.author_name}</div>
              <div><span className={`blog-badge blog-badge-${post.status}`}>{post.status}</span></div>
              <div className="blog-list-date">{fmt(post.created_at)}</div>
              <div className="blog-list-actions">
                <button className="blog-act-edit" onClick={() => openEdit(post)}>Edit</button>
                <button className={`blog-act-pub ${post.status === 'published' ? 'unpub' : 'pub'}`} onClick={() => togglePublish(post)}>
                  {post.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button className="blog-act-del" onClick={() => handleDelete(post)}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="blog-overlay" onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="blog-modal">
            <div className="blog-modal-header">
              <h2 className="blog-modal-title">{editingPost ? 'Edit Post' : 'New Post'}</h2>
              <button className="blog-modal-close" onClick={() => setIsModalOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Section Tabs */}
            <div className="blog-modal-tabs">
              {(['content','seo','settings'] as const).map(s => (
                <button key={s} className={`blog-modal-tab ${activeSection === s ? 'active' : ''}`}
                  onClick={() => setActiveSection(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  {s === 'seo' && (formErrors.meta_title || formErrors.meta_description) && <span className="blog-tab-err">!</span>}
                  {s === 'content' && (formErrors.title || formErrors.content || formErrors.excerpt || formErrors.featured_image_url) && <span className="blog-tab-err">!</span>}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="blog-modal-body">

                {/* Content Section */}
                {activeSection === 'content' && (
                  <>
                    <div className="blog-form-group">
                      <label className="blog-form-label">Title <span>*</span></label>
                      <input className={`blog-form-input ${formErrors.title ? 'error' : ''}`} type="text"
                        placeholder="Post title…" value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })} />
                      {formErrors.title && <span className="blog-form-error">{formErrors.title}</span>}
                    </div>
                    <div className="blog-form-group">
                      <label className="blog-form-label">Excerpt <span>*</span></label>
                      <textarea className={`blog-form-textarea ${formErrors.excerpt ? 'error' : ''}`}
                        rows={3} placeholder="Brief summary…" value={formData.excerpt}
                        onChange={e => setFormData({ ...formData, excerpt: e.target.value })} />
                      {formErrors.excerpt && <span className="blog-form-error">{formErrors.excerpt}</span>}
                    </div>
                    <div className="blog-form-group">
                      <label className="blog-form-label">Featured Image <span>*</span></label>
                      <ImageCropperWithUpload
                        value={formData.featured_image_url}
                        onChange={url => setFormData({ ...formData, featured_image_url: url })}
                        error={formErrors.featured_image_url}
                        aspectRatio={IMAGE_CONFIGS.blog.aspectRatio}
                      />
                    </div>
                    <div className="blog-form-group">
                      <RichTextEditor
                        label="Content *"
                        value={formData.content}
                        onChange={content => setFormData({ ...formData, content })}
                        error={formErrors.content}
                        placeholder="Write your post content…"
                      />
                    </div>
                  </>
                )}

                {/* SEO Section */}
                {activeSection === 'seo' && (
                  <>
                    <div className="blog-seo-preview">
                      <div className="blog-seo-preview-title">{formData.meta_title || formData.title || 'Page Title'}</div>
                      <div className="blog-seo-preview-url">dravohome.com/blog/{editingPost?.slug || 'post-slug'}</div>
                      <div className="blog-seo-preview-desc">{formData.meta_description || 'Meta description will appear here…'}</div>
                    </div>
                    <div className="blog-form-group">
                      <label className="blog-form-label">
                        Meta Title <span>*</span>
                        <span className={`blog-char-count ${formData.meta_title.length > 55 ? 'warn' : ''}`}>
                          {formData.meta_title.length}/60
                        </span>
                      </label>
                      <input className={`blog-form-input ${formErrors.meta_title ? 'error' : ''}`} type="text"
                        placeholder="SEO title for search engines" maxLength={60}
                        value={formData.meta_title}
                        onChange={e => setFormData({ ...formData, meta_title: e.target.value })} />
                      {formErrors.meta_title && <span className="blog-form-error">{formErrors.meta_title}</span>}
                    </div>
                    <div className="blog-form-group">
                      <label className="blog-form-label">
                        Meta Description <span>*</span>
                        <span className={`blog-char-count ${formData.meta_description.length > 150 ? 'warn' : ''}`}>
                          {formData.meta_description.length}/160
                        </span>
                      </label>
                      <textarea className={`blog-form-textarea ${formErrors.meta_description ? 'error' : ''}`}
                        rows={3} placeholder="SEO description for search engines" maxLength={160}
                        value={formData.meta_description}
                        onChange={e => setFormData({ ...formData, meta_description: e.target.value })} />
                      {formErrors.meta_description && <span className="blog-form-error">{formErrors.meta_description}</span>}
                    </div>
                  </>
                )}

                {/* Settings Section */}
                {activeSection === 'settings' && (
                  <>
                    <div className="blog-form-group">
                      <label className="blog-form-label">Status</label>
                      <select className="blog-form-select" value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    <Toggle checked={formData.is_featured} onChange={v => setFormData({ ...formData, is_featured: v })}
                      label="Featured on Homepage" desc="Show in homepage blog section" />
                  </>
                )}
              </div>

              <div className="blog-modal-footer">
                <button type="button" className="blog-btn-cancel" onClick={() => setIsModalOpen(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="blog-btn-save" disabled={submitting}>
                  {submitting ? 'Saving…' : editingPost ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
