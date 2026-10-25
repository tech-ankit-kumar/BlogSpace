const $ = s => document.querySelector(s);
const state = { user: null, activePostId: null, authMode: "login", toastTimer: null, savedOnly: false };
$("#year").textContent = new Date().getFullYear();

async function api(url, options = {}) {
  const config = { credentials: "same-origin", ...options, headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) } };
  const response = await fetch(url, config);
  const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}
function esc(v = "") {
  return String(v).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
function date(v) { return new Intl.DateTimeFormat("en", { month:"short", day:"numeric", year:"numeric" }).format(new Date(v)); }
function initials(v = "?") { return esc(v.trim().charAt(0).toUpperCase() || "?"); }
function toast(message) {
  const el = $("#toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}
function closeAll() {
  document.querySelectorAll(".backdrop").forEach(el => el.hidden = true);
  document.body.style.overflow = "";
}
function openModal(id) { $("#" + id).hidden = false; document.body.style.overflow = "hidden"; }
function closeModal(id) {
  $("#" + id).hidden = true;
  if (![...document.querySelectorAll(".backdrop")].some(el => !el.hidden)) document.body.style.overflow = "";
}
function updateHeader() {
  const host = $("#headerActions");
  if (!state.user) {
    host.innerHTML = '<button class="btn quiet" data-open-auth="login">Log in</button><button class="btn dark" data-open-auth="register">Get started ↗</button>';
  } else {
    host.innerHTML = `<span class="welcome-user">Hi, ${esc(state.user.name.split(" ")[0])}</span><button class="btn dark" id="headerWrite">Write ↗</button><button class="btn quiet" id="logoutBtn">Log out</button>`;
    $("#headerWrite").addEventListener("click", () => openPostForm());
    $("#logoutBtn").addEventListener("click", logout);
  }
}
function readingMinutes(content = "") { return Math.max(1, Math.ceil(content.trim().split(/\\s+/).filter(Boolean).length / 200)); }
function card(p) {
  const excerpt = p.content.length > 145 ? p.content.slice(0,145).trim() + "…" : p.content;
  return `<article class="post-card" tabindex="0" role="button" aria-label="Read ${esc(p.title)}" data-post-id="${esc(p.id)}">
    <div class="card-top"><span class="pill">${esc(p.category)}</span><span class="date">${date(p.createdAt)}</span></div>
    <h3>${esc(p.title)}</h3><p class="excerpt">${esc(excerpt)}</p>
    <div class="reading-time"><span>${readingMinutes(p.content)} min read</span><span>·</span><span>${p.commentCount || 0} comments</span></div>
    <div class="card-bottom"><span class="author"><span class="author-icon">${initials(p.authorName)}</span>${esc(p.authorName)}</span><div class="card-actions"><button type="button" class="mini-action ${p.likedByMe ? "is-active" : ""}" data-like="${esc(p.id)}" aria-label="Like story">♥ <span>${p.likeCount || 0}</span></button><button type="button" class="mini-action ${p.bookmarkedByMe ? "is-active" : ""}" data-bookmark="${esc(p.id)}" aria-label="Save story">${p.bookmarkedByMe ? "★" : "☆"}</button></div></div>
  </article>`;
}
async function loadPosts() {
  const params = new URLSearchParams(), q = $("#searchInput").value.trim(), cat = $("#categoryFilter").value;
  if (q) params.set("q", q); if (cat !== "all") params.set("category", cat);
  $("#postsGrid").innerHTML = '<div class="empty">Gathering good ideas ✳</div>';
  try {
    const data = await api("/api/posts?" + params.toString());
    let posts = data.posts;
    if (state.savedOnly) posts = posts.filter(p => p.bookmarkedByMe);
    const sort = $("#sortFilter")?.value || "newest";
    if (sort === "oldest") posts.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sort === "popular") posts.sort((a,b) => (b.likeCount || 0) - (a.likeCount || 0) || new Date(b.createdAt) - new Date(a.createdAt));
    else posts.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    $("#statusMessage").textContent = "";
    $("#resultsMeta").textContent = `${posts.length} ${posts.length === 1 ? "story" : "stories"}${state.savedOnly ? " saved by you" : " to explore"}`;
    $("#postsGrid").innerHTML = posts.length ? posts.map(card).join("") : `<div class="empty">${state.savedOnly ? "No saved stories yet. Tap the star on a story to keep it here." : "No stories found. Try another search, or be the first to write one. ✳"}</div>`;
  } catch (e) {
    $("#postsGrid").innerHTML = '<div class="empty">Could not load stories. Is the server running?</div>';
    $("#statusMessage").textContent = e.message;
  }
}
function setAuthMode(mode) {
  state.authMode = mode; const register = mode === "register";
  $("#authTitle").textContent = register ? "Your story starts here." : "Welcome back.";
  $("#authSubtitle").textContent = register ? "A little space to share a lot of ideas." : "Pick up where your curiosity left off.";
  $("#nameField").hidden = !register; $("#authName").required = register;
  $("#authPassword").autocomplete = register ? "new-password" : "current-password";
  $("#authSubmit").textContent = register ? "Create account ↗" : "Log in ↗";
  document.querySelectorAll("[data-auth-tab]").forEach(b => b.classList.toggle("active", b.dataset.authTab === mode));
  $("#authError").textContent = "";
}
function openAuth(mode = "login") {
  $("#authForm").reset(); setAuthMode(mode); openModal("authModal");
}
async function submitAuth(event) {
  event.preventDefault(); $("#authError").textContent = "";
  const body = { email: $("#authEmail").value.trim(), password: $("#authPassword").value };
  if (state.authMode === "register") body.name = $("#authName").value.trim();
  const button = $("#authSubmit"); button.disabled = true;
  try {
    const data = await api("/api/auth/" + state.authMode, { method:"POST", body:JSON.stringify(body) });
    state.user = data.user; updateHeader(); closeModal("authModal"); toast(state.authMode === "register" ? "Welcome to BlogSpace!" : "You're logged in."); await loadPosts();
  } catch (e) { $("#authError").textContent = e.message; }
  finally { button.disabled = false; }
}
async function logout() {
  try { await api("/api/auth/logout", { method:"POST" }); state.user = null; updateHeader(); toast("You've logged out."); await loadPosts(); }
  catch (e) { toast(e.message); }
}
function openPostForm(post = null) {
  if (!state.user) return openAuth("register");
  $("#postForm").reset(); $("#postId").value = post?.id || "";
  $("#postTitle").value = post?.title || ""; $("#postContent").value = post?.content || "";
  $("#postCategory").value = post?.category || "Development";
  $("#postModalTitle").textContent = post ? "Edit your story." : "Write a story.";
  $("#postSubmit").textContent = post ? "Save changes ↗" : "Publish story ↗";
  $("#postError").textContent = ""; openModal("postModal");
}
async function savePost(event) {
  event.preventDefault(); $("#postError").textContent = "";
  const id = $("#postId").value, body = { title:$("#postTitle").value.trim(), content:$("#postContent").value.trim(), category:$("#postCategory").value };
  try {
    await api(id ? "/api/posts/" + encodeURIComponent(id) : "/api/posts", { method:id ? "PUT" : "POST", body:JSON.stringify(body) });
    closeModal("postModal"); toast(id ? "Story updated." : "Story published."); await loadPosts(); if (id) await openPost(id);
  } catch (e) { $("#postError").textContent = e.message; }
}
function owns(post) { return state.user && post.authorId === state.user.id; }
async function openPost(id) {
  state.activePostId = id;
  try {
    const { post, comments } = await api("/api/posts/" + encodeURIComponent(id)), owner = owns(post);
    $("#detailBody").innerHTML = `
      <div class="detail-category"><span class="pill">${esc(post.category)}</span></div><h2 id="detailTitle">${esc(post.title)}</h2>
      <div class="detail-meta"><span>By ${esc(post.authorName)}</span><span>${date(post.createdAt)}</span><span>${readingMinutes(post.content)} min read</span>${post.updatedAt !== post.createdAt ? "<span>Edited</span>" : ""}</div>
      <div class="detail-content">${esc(post.content)}</div>
      <div class="detail-actions"><button class="btn outline" id="detailLike">${post.likedByMe ? "♥ Liked" : "♡ Like"} · ${post.likeCount || 0}</button><button class="btn outline" id="detailBookmark">${post.bookmarkedByMe ? "★ Saved" : "☆ Save for later"}</button></div>
      ${owner ? '<div class="detail-actions"><button class="btn outline" id="editPost">Edit story</button><button class="btn quiet" id="deletePost">Delete story</button></div>' : ""}
      <h3 class="comment-heading">The conversation (${comments.length})</h3><div id="commentsList">${comments.length ? comments.map(c => `<div class="comment-item"><div class="comment-head"><span>${esc(c.authorName)} <span class="comment-date">· ${date(c.createdAt)}</span></span>${state.user && (c.userId === state.user.id || owner) ? `<button class="comment-delete" data-delete-comment="${esc(c.id)}">Delete</button>` : ""}</div><p class="comment-text">${esc(c.text)}</p></div>`).join("") : '<p class="comment-text">No comments yet. Start the conversation.</p>'}</div>
      ${state.user ? '<form id="commentForm" class="comment-form"><input id="commentText" maxlength="1000" minlength="2" required placeholder="Add something thoughtful..."><button class="btn dark" type="submit">Comment ↗</button></form>' : '<p class="comment-text">Log in to join the conversation.</p><button class="btn outline" id="detailLogin">Log in to comment</button>'}`;
    $("#detailLike").addEventListener("click", () => toggleReaction("like", post.id, true));
    $("#detailBookmark").addEventListener("click", () => toggleReaction("bookmark", post.id, true));
    if (owner) {
      $("#editPost").addEventListener("click", () => { closeModal("detailModal"); openPostForm(post); });
      $("#deletePost").addEventListener("click", () => deletePost(post.id));
    }
    if (state.user) $("#commentForm").addEventListener("submit", addComment);
    else $("#detailLogin").addEventListener("click", () => { closeModal("detailModal"); openAuth("login"); });
    $("#detailBody").querySelectorAll("[data-delete-comment]").forEach(b => b.addEventListener("click", () => deleteComment(b.dataset.deleteComment)));
    openModal("detailModal");
  } catch (e) { toast(e.message); }
}
async function deletePost(id) {
  if (!confirm("Delete this story and its comments? This cannot be undone.")) return;
  try { await api("/api/posts/" + encodeURIComponent(id), { method:"DELETE" }); closeModal("detailModal"); toast("Story deleted."); await loadPosts(); }
  catch (e) { toast(e.message); }
}
async function addComment(event) {
  event.preventDefault(); const input = $("#commentText");
  try { await api(`/api/posts/${encodeURIComponent(state.activePostId)}/comments`, { method:"POST", body:JSON.stringify({ text:input.value.trim() }) }); await openPost(state.activePostId); await loadPosts(); toast("Comment added."); }
  catch (e) { toast(e.message); }
}
async function deleteComment(id) {
  try { await api("/api/comments/" + encodeURIComponent(id), { method:"DELETE" }); await openPost(state.activePostId); await loadPosts(); toast("Comment deleted."); }
  catch (e) { toast(e.message); }
}
async function toggleReaction(kind, postId, refreshDetail = false) {
  if (!state.user) {
    if (refreshDetail) closeModal("detailModal");
    openAuth("login");
    return;
  }
  try {
    const result = await api(`/api/posts/${encodeURIComponent(postId)}/${kind}`, { method: "POST" });
    if (kind === "like") toast(result.liked ? "Added to your liked stories." : "Like removed.");
    else toast(result.bookmarked ? "Saved for later." : "Removed from saved stories.");
    await loadPosts();
    if (refreshDetail && !$("#detailModal").hidden) await openPost(postId);
  } catch (e) { toast(e.message); }
}

document.addEventListener("click", event => {
  const likeButton = event.target.closest("[data-like]");
  if (likeButton) { event.stopPropagation(); toggleReaction("like", likeButton.dataset.like); return; }
  const bookmarkButton = event.target.closest("[data-bookmark]");
  if (bookmarkButton) { event.stopPropagation(); toggleReaction("bookmark", bookmarkButton.dataset.bookmark); return; }
  const writingButton = event.target.closest("[data-start-writing]");
  if (writingButton) {
    if (state.user) openPostForm();
    else openAuth("register");
    return;
  }
  const authButton = event.target.closest("[data-open-auth]");
  if (authButton) { openAuth(authButton.dataset.openAuth); return; }
  if (event.target.closest("[data-close-modal]")) { closeAll(); return; }
  const postCard = event.target.closest("[data-post-id]");
  if (postCard) openPost(postCard.dataset.postId);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeAll();
  if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-post-id]")) { event.preventDefault(); openPost(event.target.dataset.postId); }
});
document.querySelectorAll(".backdrop").forEach(b => b.addEventListener("click", e => { if (e.target === b) closeModal(b.id); }));
document.querySelectorAll("[data-topic]").forEach(button => button.addEventListener("click", () => {
  const category = button.dataset.topic;
  const filter = $("#categoryFilter");
  if ([...filter.options].some(option => option.value === category || option.textContent === category)) {
    filter.value = category;
    state.savedOnly = false;
    $("#savedFilterBtn").classList.remove("active-filter");
    $("#savedFilterBtn").setAttribute("aria-pressed", "false");
    $("#savedFilterBtn").textContent = "♡ Saved stories";
    loadPosts();
    $("#stories").scrollIntoView({ behavior: "smooth" });
  }
}));
document.querySelectorAll("[data-auth-tab]").forEach(b => b.addEventListener("click", () => setAuthMode(b.dataset.authTab)));
$("#authForm").addEventListener("submit", submitAuth);
$("#postForm").addEventListener("submit", savePost);
$("#searchInput").addEventListener("input", () => { clearTimeout(window.searchTimer); window.searchTimer = setTimeout(loadPosts, 250); });
$("#categoryFilter").addEventListener("change", loadPosts);
$("#sortFilter").addEventListener("change", loadPosts);
$("#savedFilterBtn").addEventListener("click", () => {
  if (!state.user) { openAuth("login"); return; }
  state.savedOnly = !state.savedOnly;
  $("#savedFilterBtn").classList.toggle("active-filter", state.savedOnly);
  $("#savedFilterBtn").setAttribute("aria-pressed", String(state.savedOnly));
  $("#savedFilterBtn").textContent = state.savedOnly ? "★ Showing saved" : "♡ Saved stories";
  loadPosts();
});
$("#writePostBtn").addEventListener("click", e => { e.preventDefault(); openPostForm(); });
async function init() {
  try { state.user = (await api("/api/auth/me")).user; } catch (_) { state.user = null; }
  updateHeader(); await loadPosts();
}
init();
