Architecture & Implementation Plan: Homepage Enhancements
This document outlines the step-by-step strategy for implementing the three requested features without altering any code right now.

1. Live Offer Marquee / Ticker (Global)
Objective: A scrolling ticker above the navbar on the homepage (or globally) displaying active offers, manageable via a new admin tab.

Backend (Django)
New Model: Create a SiteSettings or PromotionSettings singleton model.
is_marquee_enabled (Boolean)
marquee_offers (ManyToManyField to Offer)
API Endpoint: Create GET /api/settings/promotions/ to expose these settings and the serialized offer details.
Admin Panel (Next.js)
New Tab ("Promotions & Extras"): Add a new navigation item in the admin dashboard.
UI Elements:
A master toggle switch: "Enable Top Marquee".
A multi-select dropdown to search and attach specific active Offers to the marquee.
User Frontend (Next.js)
Component: Build <TopMarquee offers={offers} />.
Placement: Inject this directly into app/layout.tsx (or app/page.tsx if strictly homepage only) above the <Navbar />.
Logic: Fetch the promotions endpoint on load. If is_marquee_enabled is true, render the ticker mapping over the returned offers.
2. Dynamic Welcome Offer Pop-up Modal
Objective: A first-visit pop-up that cycles through offers daily/hourly or shows a single featured offer.

Backend (Django)
Extend PromotionSettings: Add fields to the model created in Step 1.
is_popup_enabled (Boolean)
popup_strategy (Choices: single, cycle_daily, cycle_hourly)
popup_offers (ManyToManyField to Offer)
Admin Panel (Next.js)
UI Elements: In the "Promotions & Extras" tab, add a "Welcome Pop-up" section.
Toggle: "Enable Welcome Pop-up".
Dropdown: "Cycling Strategy" (Single, Daily, Hourly).
Multi-select: Choose which offers are eligible to be shown.
User Frontend (Next.js)
Component: Build <WelcomeOfferModal offer={selectedOffer} /> with a premium glassmorphism design and an "X" close button.
State Management (Cookies/LocalStorage):
Check localStorage.getItem('has_seen_welcome_popup').
If null, fetch settings.
Cycling Logic:
If cycle_daily: Calculate dayOfYear % popup_offers.length to pick the index.
If cycle_hourly: Calculate hourOfDay % popup_offers.length.
Render the modal. When the user clicks "Close", set the localStorage key so it doesn't annoy them on subsequent reloads.
3. Dynamic Page Builder (CMS) for Custom Homepage Sections
Objective: A full CMS-style feature that allows you to dynamically create, configure, and inject brand new sections (Product Sliders, Image Banners, Product Grids, Collection Lists) anywhere alongside your existing static components.

Backend (Django)
New Model: Create a CustomPageBlock model to represent these new sections.
block_type (Choices: product_slider, product_grid, image_banner, offer_split)
title (String, e.g., "Our Summer Picks")
is_active (Boolean)
display_order (Integer, determines where it sits relative to other blocks or static sections)
config (JSONField): This is crucial. It stores the specific data for that block type. For example:
If block_type == 'product_slider', config might contain {"product_ids": [10, 15, 22]}.
If block_type == 'image_banner', config might contain {"image_url": "/summer.jpg", "link": "/collections/summer"}.
API Endpoint: GET /api/homepage/custom-blocks/ (Returns active blocks ordered by display_order).
Admin Panel (Next.js)
Page Builder UI: In the "Homepage Layout" tab, add an "Add New Block" button.
Block Creation Flow:
Admin clicks "Add New Block".
Modal asks to select the Block Type (Slider, Grid, Banner).
Based on the selection, a dynamic form appears. (e.g., If "Slider", it renders a multi-select to pick existing products; If "Banner", an image upload field).
Ordering: A drag-and-drop list to reorder these newly created blocks.
User Frontend (Next.js)
Dynamic Block Components: Build highly reusable React components:
<DynamicProductSlider products={...} />
<DynamicProductGrid products={...} /> 
<DynamicImageBanner config={...} />
Refactoring app/page.tsx:
We fetch the CustomPageBlock array from the API.
We create an Index based system to interweave your existing static sections (like <Hero />) with the new dynamic blocks.
Alternatively, we can just append the dynamic blocks below the main hero but above the footer, mapping through them and rendering the appropriate component based on block_type.
Next Steps
Review this plan and let me know if the logic aligns with your vision. When you're ready, we can start executing it step-by-step, likely beginning with the Django backend modifications.