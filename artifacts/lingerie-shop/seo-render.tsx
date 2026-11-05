import React from 'react';
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { Router } from 'wouter';
import Blog from './src/pages/blog';
import BlogArticle, { CONTENT } from './src/pages/blog-article';
import CGV from './src/pages/cgv';

export function renderPages() {
  const routes = [
    {url:'/blog', Component:Blog},
    {url:'/cgv', Component:CGV},
    ...Object.keys(CONTENT).map(slug=>({url:`/blog/${slug}`,Component:BlogArticle})),
  ];
  return routes.map(({url,Component})=>{
    const context: any = {};
    let html = renderToString(<HelmetProvider context={context}><Router ssrPath={url}><Component /></Router></HelmetProvider>);
    const {helmet} = context;
    let head = '';
    if (helmet) head = ['title','meta','link','script'].map(key=>helmet[key].toString()).join('');
    else html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>|<meta\b[^>]*>|<link\b[^>]*>|<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, tag=>{head+=tag;return '';});
    head = head.replace(/<(title|meta|link|script)\b/g, '<$1 data-seo-prerender="true"');
    return {url,html,head};
  });
}
