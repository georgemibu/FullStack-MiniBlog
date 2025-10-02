import { useState, useEffect } from "react";

export default function App() {
  const API = "http://localhost:3001";

  // datos
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);

  // inputs
  const [userName, setUserName] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postUser, setPostUser] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentUser, setCommentUser] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  // cargar usuarios y posts al iniciar
  useEffect(() => {
    fetch(`${API}/users`)
      .then((r) => r.json())
      .then(setUsers);

    fetch(`${API}/posts`)
      .then((r) => r.json())
      .then(setPosts);
  }, []);

  // crear usuario
  async function addUser(e) {
    e.preventDefault();
    if (!userName) return;
    const res = await fetch(`${API}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: userName }),
    });
    const user = await res.json();
    setUsers((prev) => [...prev, user]);
    setUserName("");
  }

  // crear post
  async function addPost(e) {
    e.preventDefault();
    if (!postTitle || !postContent || !postUser) return;
    const res = await fetch(`${API}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: postTitle,
        content: postContent,
        user_id: Number(postUser),
      }),
    });
    const post = await res.json();
    setPosts((prev) => [...prev, post]);
    setPostTitle("");
    setPostContent("");
    setPostUser("");
  }

  // cargar comentarios de un post
  async function loadComments(postId) {
    setSelectedPost(postId);
    const res = await fetch(`${API}/comments?post_id=${postId}`);
    setComments(await res.json());
  }

  // agregar comentario
  async function addComment(e) {
    e.preventDefault();
    if (!commentContent || !commentUser || !selectedPost) return;
    const res = await fetch(`${API}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: commentContent,
        user_id: Number(commentUser),
        post_id: selectedPost,
      }),
    });
    const c = await res.json();
    setComments((prev) => [
      ...prev,
      { ...c, author: users.find((u) => u.id === c.user_id)?.name },
    ]);
    setCommentContent("");
    setCommentUser("");
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Mini Blog con Comentarios</h1>

      {/* Usuarios */}
      <section>
        <h2>Usuarios</h2>
        <form onSubmit={addUser}>
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Nombre"
          />
          <button type="submit">Agregar</button>
        </form>
        <ul>
          {users.map((u) => (
            <li key={u.id}>{u.name}</li>
          ))}
        </ul>
      </section>

      {/* Crear Post */}
      <section>
        <h2>Crear Post</h2>
        <form onSubmit={addPost}>
          <input
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Título"
          />
          <br />
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Contenido"
          />
          <br />
          <select
            value={postUser}
            onChange={(e) => setPostUser(e.target.value)}
          >
            <option value="">Selecciona autor</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <button type="submit">Publicar</button>
        </form>
      </section>

      {/* Lista de posts */}
      <section>
        <h2>Posts</h2>
        <ul>
          {posts.map((p) => (
            <li key={p.id}>
              <h3>{p.title}</h3>
              <p>{p.content}</p>
              <small>Por: {p.author}</small>
              <br />
              <button onClick={() => loadComments(p.id)}>Ver comentarios</button>
            </li>
          ))}
        </ul>
      </section>

      {/* Comentarios */}
      {selectedPost && (
        <section>
          <h2>Comentarios del Post {selectedPost}</h2>
          <form onSubmit={addComment}>
            <input
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Comentario"
            />
            <select
              value={commentUser}
              onChange={(e) => setCommentUser(e.target.value)}
            >
              <option value="">Usuario</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <button type="submit">Agregar comentario</button>
          </form>
          <ul>
            {comments.map((c) => (
              <li key={c.id}>
                {c.content} — <i>{c.author}</i>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
