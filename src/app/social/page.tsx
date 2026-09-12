"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Camera, CheckCircle2, ChevronDown, Heart, ImagePlus, MessageCircle,
  MoreHorizontal, PawPrint, Play, Plus, Search, Send, ShieldCheck, UsersRound, Video, X,
} from "lucide-react";
import { Avatar, FilterChip, SearchBar } from "@/components";
import { usePetcare } from "@/features/petcare-store";
import { WorkspaceShell } from "@/features/workspace-shell";

type MediaKind = "image" | "video";

type SocialComment = {
  id: string;
  author: string;
  text: string;
};

type SocialPost = {
  id: string;
  ownerId?: string;
  author: string;
  handle: string;
  petName: string;
  petImage?: string;
  avatar?: string;
  caption: string;
  media: string;
  mediaKind: MediaKind;
  createdAt: string;
  likes: number;
  liked: boolean;
  visibility: "Friends" | "Community";
  comments: SocialComment[];
};

const socialStorageKey = "petcare-hub-social-posts-v1";

const seedPosts: SocialPost[] = [
  {
    id: "social-luna", author: "Naina Kapoor", handle: "@luna.and.naina", petName: "Luna", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=140&q=80",
    caption: "Golden-hour walk and the world's most serious leaf inspector.", media: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1200&q=85", mediaKind: "image", createdAt: "2h ago", likes: 184, liked: false, visibility: "Community",
    comments: [{ id: "comment-luna", author: "@miso.mom", text: "That face!" }],
  },
  {
    id: "social-oreo", author: "Karan Shah", handle: "@oreo.explores", petName: "Oreo", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=140&q=80",
    caption: "A little agility practice before breakfast. Small wins count.", media: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=1200&q=85", mediaKind: "image", createdAt: "5h ago", likes: 96, liked: true, visibility: "Friends",
    comments: [{ id: "comment-oreo", author: "@weekend.wags", text: "Great focus, Oreo!" }, { id: "comment-oreo-2", author: "@poppy.paws", text: "We need a lesson." }],
  },
  {
    id: "social-pickle", author: "Priya Menon", handle: "@pickle.the.cat", petName: "Pickle", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=140&q=80",
    caption: "Proof that the new window hammock has received full approval.", media: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=85", mediaKind: "image", createdAt: "Yesterday", likes: 221, liked: false, visibility: "Community",
    comments: [{ id: "comment-pickle", author: "@miso.mom", text: "The perfect office supervisor." }],
  },
];

function postId() {
  return `social-${Math.random().toString(36).slice(2, 10)}`;
}

function readMedia(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("We could not read that file."));
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Unsupported media result."));
    reader.readAsDataURL(file);
  });
}

export default function SocialPage() {
  const { pets, user } = usePetcare();
  const [posts, setPosts] = useState<SocialPost[]>(seedPosts);
  const [loadedUserId, setLoadedUserId] = useState("");
  const [feed, setFeed] = useState<"All" | "Friends" | "Photos" | "Videos">("All");
  const [query, setQuery] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [petId, setPetId] = useState("");
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<"Friends" | "Community">("Friends");
  const [media, setMedia] = useState("");
  const [mediaKind, setMediaKind] = useState<MediaKind>("image");
  const [mediaName, setMediaName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setLoadedUserId("");
    try {
      const saved = window.localStorage.getItem(`${socialStorageKey}:${user.id}`);
      const personalPosts = saved ? JSON.parse(saved) as SocialPost[] : [];
      setPosts([...personalPosts, ...seedPosts]);
    } catch {
      setPosts(seedPosts);
    } finally {
      setLoadedUserId(user.id);
    }
  }, [user.id]);

  useEffect(() => {
    if (loadedUserId !== user.id) return;
    const personalPosts = posts.filter((post) => post.ownerId === user.id);
    try {
      window.localStorage.setItem(`${socialStorageKey}:${user.id}`, JSON.stringify(personalPosts));
    } catch {
      // Browser storage can reject large media. The post still remains available for this session.
    }
  }, [loadedUserId, posts, user.id]);

  useEffect(() => {
    if (pets.length && !pets.some((pet) => pet.id === petId)) setPetId(pets[0].id);
  }, [petId, pets]);

  const shownPosts = useMemo(() => posts.filter((post) => {
    const matchesFeed = feed === "All" || (feed === "Friends" && post.visibility === "Friends") || (feed === "Photos" && post.mediaKind === "image") || (feed === "Videos" && post.mediaKind === "video");
    const haystack = `${post.author} ${post.handle} ${post.petName} ${post.caption}`.toLowerCase();
    return matchesFeed && haystack.includes(query.toLowerCase());
  }), [feed, posts, query]);

  const selectedPet = pets.find((pet) => pet.id === petId);

  const clearComposer = () => {
    setCaption("");
    setMedia("");
    setMediaName("");
    setMediaKind("image");
    setUploadError("");
  };

  const closeComposer = () => {
    setComposerOpen(false);
    clearComposer();
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setUploadError("Choose an image or a video file.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setUploadError("For this local demo, choose a file up to 4 MB so it can stay in your browser workspace.");
      return;
    }
    try {
      setUploadError("");
      setMedia(await readMedia(file));
      setMediaKind(file.type.startsWith("video/") ? "video" : "image");
      setMediaName(file.name);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "We could not prepare that file.");
    }
  };

  const publishPost = () => {
    if (!selectedPet || !caption.trim() || !media) {
      setUploadError("Choose a pet, add a caption, and select a photo or video before sharing.");
      return;
    }
    const newPost: SocialPost = {
      id: postId(), ownerId: user.id, author: user.name, handle: `@${user.name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "") || "pet-parent"}`,
      petName: selectedPet.name, petImage: selectedPet.image, caption: caption.trim(), media, mediaKind, createdAt: "Just now", likes: 0, liked: false, visibility, comments: [],
    };
    setPosts((current) => [newPost, ...current]);
    setNotice(`${selectedPet.name}'s post is now visible to ${visibility === "Friends" ? "your friends in this local demo" : "the local demo community"}.`);
    closeComposer();
  };

  const toggleLike = (id: string) => setPosts((current) => current.map((post) => post.id === id ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } : post));

  const addComment = (id: string) => {
    const text = commentDrafts[id]?.trim();
    if (!text) return;
    setPosts((current) => current.map((post) => post.id === id ? {
      ...post,
      comments: [...post.comments, { id: postId(), author: `@${user.name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}`, text }],
    } : post));
    setCommentDrafts((current) => ({ ...current, [id]: "" }));
  };

  return <WorkspaceShell title="Pet social" subtitle="Share the bright everyday moments with your pet-owning circle." actions={<button type="button" className="btn-primary" onClick={() => setComposerOpen(true)}><Plus size={16}/> Create post</button>}>
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-50 via-white to-mint p-6 sm:p-8"><div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end"><div><span className="eyebrow bg-white"><UsersRound size={14}/> Pet-owner community</span><h1 className="mt-4 text-3xl font-black tracking-[-.04em] text-ink sm:text-4xl">A little feed for the big parts of pet life.</h1><p className="mt-3 max-w-3xl leading-7 text-slate-600">Post pet photos and short videos, celebrate routines, and keep the conversation with people who understand. In local mode, posts and uploads remain in this browser workspace rather than being sent to a public network.</p></div><button type="button" onClick={() => setComposerOpen(true)} className="flex min-h-28 min-w-52 flex-col items-center justify-center rounded-3xl border border-dashed border-teal-300 bg-white/80 p-5 text-center font-black text-teal-800 transition hover:bg-white"><Camera size={24}/><span className="mt-2">Share a pet moment</span><span className="mt-1 text-xs font-semibold text-teal-700">Photo or video</span></button></div></section>

      {notice ? <div className="flex items-start justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900"><span className="flex gap-2"><CheckCircle2 className="shrink-0" size={18}/>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={17}/></button></div> : null}

      <section className="surface p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{(["All", "Friends", "Photos", "Videos"] as const).map((item) => <FilterChip key={item} label={item} active={feed === item} onClick={() => setFeed(item)} icon={item === "Videos" ? Video : item === "Photos" ? Camera : undefined}/>)}</div><SearchBar className="w-full lg:max-w-sm" value={query} onChange={setQuery} placeholder="Search pets, captions, and people" ariaLabel="Search pet social"/></div></section>

      <section className="mx-auto grid max-w-2xl gap-6">{shownPosts.map((post) => <article key={post.id} className="surface overflow-hidden"><div className="flex items-center gap-3 p-4"><Avatar src={post.avatar ?? post.petImage} name={post.author} alt={`${post.author} profile`} size="md"/><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><p className="truncate font-black text-ink">{post.author}</p>{post.ownerId ? <CheckCircle2 className="text-teal-600" size={15} aria-label="Your post"/> : null}</div><p className="truncate text-xs font-semibold text-slate-500">{post.handle} - {post.petName} - {post.createdAt} - {post.visibility}</p></div><button type="button" aria-label="Post options" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><MoreHorizontal size={20}/></button></div><div className="relative bg-slate-100">{post.mediaKind === "video" ? <video src={post.media} controls className="max-h-[34rem] w-full bg-black" preload="metadata"/> : <img src={post.media} alt={post.caption || `${post.petName}'s post`} className="max-h-[38rem] w-full object-cover"/>}{post.mediaKind === "video" ? <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950/65 px-2.5 py-1 text-xs font-bold text-white"><Play size={12} fill="currentColor"/> Video</span> : null}</div><div className="p-4"><div className="flex items-center gap-2"><button type="button" className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold transition ${post.liked ? "bg-rose-50 text-rose-700" : "text-slate-600 hover:bg-slate-100"}`} onClick={() => toggleLike(post.id)} aria-pressed={post.liked}><Heart size={18} fill={post.liked ? "currentColor" : "none"}/>{post.likes}</button><span className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-600"><MessageCircle size={18}/>{post.comments.length}</span></div><p className="mt-3 text-sm leading-6 text-slate-700"><strong className="font-black text-ink">{post.petName}</strong> {post.caption}</p>{post.comments.length ? <div className="mt-3 space-y-1.5 text-sm">{post.comments.slice(-2).map((comment) => <p key={comment.id} className="text-slate-600"><strong className="mr-1 font-bold text-ink">{comment.author}</strong>{comment.text}</p>)}</div> : null}<form className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3" onSubmit={(event) => { event.preventDefault(); addComment(post.id); }}><input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" value={commentDrafts[post.id] ?? ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} placeholder={`Reply about ${post.petName}`}/><button type="submit" className="rounded-lg p-2 text-teal-700 hover:bg-teal-50" aria-label="Post comment"><Send size={17}/></button></form></div></article>)}{!shownPosts.length ? <div className="surface p-10 text-center"><Search className="mx-auto text-moss" size={28}/><h2 className="mt-3 font-black text-ink">Nothing matches that view yet.</h2><p className="mt-2 text-sm text-slate-600">Try another feed filter or clear your search.</p><button className="btn-secondary mt-5" type="button" onClick={() => { setFeed("All"); setQuery(""); }}>Reset feed</button></div> : null}</section>

      <section className="rounded-3xl border border-teal-100 bg-teal-50/70 p-5"><div className="flex gap-3"><ShieldCheck className="shrink-0 text-teal-700" size={21}/><div><h2 className="font-black text-ink">Share thoughtfully</h2><p className="mt-2 text-sm leading-6 text-slate-600">Avoid posting microchip numbers, medical documents, home addresses or real-time location. Use the pet passport for controlled care information instead. This local demo does not create a public social network account or send a notification outside this browser.</p></div></div></section>
    </div>

    {composerOpen ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="new-post-title"><div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><span className="eyebrow"><ImagePlus size={14}/> New pet moment</span><h2 id="new-post-title" className="mt-3 text-2xl font-black text-ink">Create a post</h2></div><button type="button" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" onClick={closeComposer} aria-label="Close"><X size={20}/></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label><span className="field-label">Featuring</span><div className="relative mt-1"><select className="field appearance-none pr-10" value={petId} onChange={(event) => setPetId(event.target.value)} disabled={!pets.length}><option value="">Choose a pet</option>{pets.map((pet) => <option value={pet.id} key={pet.id}>{pet.name} - {pet.breed}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 text-slate-400" size={18}/></div></label><label><span className="field-label">Who can see this?</span><div className="relative mt-1"><select className="field appearance-none pr-10" value={visibility} onChange={(event) => setVisibility(event.target.value as "Friends" | "Community")}><option value="Friends">Friends only</option><option value="Community">Local demo community</option></select><ChevronDown className="pointer-events-none absolute right-3 top-3 text-slate-400" size={18}/></div></label></div><label className="mt-4 block"><span className="field-label">Caption</span><textarea className="field mt-1 min-h-28 resize-y" value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={400} placeholder="What made this moment special?"/><span className="mt-1 block text-right text-xs text-slate-400">{caption.length}/400</span></label><div className="mt-3"><span className="field-label">Photo or video</span><label className="mt-1 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center transition hover:border-teal-300 hover:bg-teal-50"><input className="sr-only" type="file" accept="image/*,video/mp4,video/webm,video/quicktime" onChange={(event) => { void onFileChange(event); }}/>{media ? mediaKind === "video" ? <video className="max-h-56 rounded-xl" src={media} controls/> : <img className="max-h-56 rounded-xl object-cover" src={media} alt="Selected upload preview"/> : <><ImagePlus className="text-teal-700" size={28}/><span className="mt-2 font-bold text-ink">Choose a photo or short video</span><span className="mt-1 text-xs text-slate-500">Up to 4 MB - stored locally in this browser</span></>}{mediaName ? <span className="mt-3 text-xs font-bold text-slate-600">{mediaName}</span> : null}</label>{uploadError ? <p className="mt-2 text-sm font-medium text-rose-600">{uploadError}</p> : null}</div><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button className="btn-ghost justify-center" type="button" onClick={closeComposer}>Cancel</button><button className="btn-primary justify-center" type="button" onClick={publishPost}><Send size={16}/> Share post</button></div></div></div> : null}
  </WorkspaceShell>;
}
