import { useEffect, useState } from 'react'
import './App.css'

// ---------- localStorage 유틸 ----------
const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value))

const formatDate = (ts) => {
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ---------- 헤더 ----------
function Header({ user, go, onLogout }) {
  return (
    <header className="header">
      <h1 className="logo" onClick={() => go('list')}>
        💬 우리 커뮤니티
      </h1>
      <nav className="nav">
        <button className="link" onClick={() => go('list')}>자유게시판</button>
        {user ? (
          <>
            <span className="hello"><b>{user.nickname}</b>님 환영합니다</span>
            <button className="btn small" onClick={onLogout}>로그아웃</button>
          </>
        ) : (
          <>
            <button className="btn small" onClick={() => go('login')}>로그인</button>
            <button className="btn small outline" onClick={() => go('signup')}>회원가입</button>
          </>
        )}
      </nav>
    </header>
  )
}

// ---------- 로그인 ----------
function Login({ users, onLogin, go }) {
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const found = users.find((u) => u.id === id && u.pw === pw)
    if (!found) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
      return
    }
    onLogin(found)
  }

  return (
    <form className="card auth" onSubmit={submit}>
      <h2>로그인</h2>
      <input placeholder="아이디" value={id} onChange={(e) => setId(e.target.value)} />
      <input type="password" placeholder="비밀번호" value={pw} onChange={(e) => setPw(e.target.value)} />
      {error && <p className="error">{error}</p>}
      <button className="btn" type="submit">로그인</button>
      <p className="sub">
        계정이 없으신가요? <button type="button" className="link" onClick={() => go('signup')}>회원가입</button>
      </p>
    </form>
  )
}

// ---------- 회원가입 ----------
function Signup({ users, onSignup, go }) {
  const [form, setForm] = useState({ id: '', pw: '', pw2: '', nickname: '' })
  const [error, setError] = useState('')

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const { id, pw, pw2, nickname } = form
    if (!id.trim() || !pw || !nickname.trim()) return setError('모든 항목을 입력하세요.')
    if (id.length < 4) return setError('아이디는 4자 이상이어야 합니다.')
    if (pw.length < 4) return setError('비밀번호는 4자 이상이어야 합니다.')
    if (pw !== pw2) return setError('비밀번호가 일치하지 않습니다.')
    if (users.some((u) => u.id === id)) return setError('이미 사용 중인 아이디입니다.')
    if (users.some((u) => u.nickname === nickname)) return setError('이미 사용 중인 닉네임입니다.')
    onSignup({ id: id.trim(), pw, nickname: nickname.trim() })
  }

  return (
    <form className="card auth" onSubmit={submit}>
      <h2>회원가입</h2>
      <input name="id" placeholder="아이디 (4자 이상)" value={form.id} onChange={change} />
      <input name="nickname" placeholder="닉네임" value={form.nickname} onChange={change} />
      <input name="pw" type="password" placeholder="비밀번호 (4자 이상)" value={form.pw} onChange={change} />
      <input name="pw2" type="password" placeholder="비밀번호 확인" value={form.pw2} onChange={change} />
      {error && <p className="error">{error}</p>}
      <button className="btn" type="submit">가입하기</button>
      <p className="sub">
        이미 계정이 있으신가요? <button type="button" className="link" onClick={() => go('login')}>로그인</button>
      </p>
    </form>
  )
}

// ---------- 게시글 목록 ----------
const PAGE_SIZE = 10

function PostList({ posts, user, go }) {
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)

  const filtered = posts
    .filter((p) => p.title.includes(keyword) || p.content.includes(keyword) || p.author.includes(keyword))
    .sort((a, b) => b.createdAt - a.createdAt)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const write = () => {
    if (!user) {
      alert('로그인 후 글을 작성할 수 있습니다.')
      go('login')
      return
    }
    go('write')
  }

  return (
    <div className="card">
      <div className="board-top">
        <h2>자유게시판</h2>
        <div className="board-actions">
          <input
            className="search"
            placeholder="제목·내용·작성자 검색"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
          />
          <button className="btn" onClick={write}>글쓰기</button>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th className="num">번호</th>
            <th>제목</th>
            <th className="author">작성자</th>
            <th className="date">작성일</th>
            <th className="num">조회</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.length === 0 ? (
            <tr>
              <td colSpan="5" className="empty">게시글이 없습니다.</td>
            </tr>
          ) : (
            pageItems.map((p) => (
              <tr key={p.id} onClick={() => go('detail', p.id)}>
                <td className="num">{p.no}</td>
                <td className="title">
                  {p.title}
                  {p.comments.length > 0 && <span className="cmt-count">[{p.comments.length}]</span>}
                </td>
                <td className="author">{p.author}</td>
                <td className="date">{formatDate(p.createdAt).slice(0, 10)}</td>
                <td className="num">{p.views}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button key={n} className={n === current ? 'active' : ''} onClick={() => setPage(n)}>
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------- 글쓰기 / 수정 ----------
function PostForm({ initial, onSubmit, go }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력하세요.')
      return
    }
    onSubmit({ title: title.trim(), content: content.trim() })
  }

  return (
    <form className="card post-form" onSubmit={submit}>
      <h2>{initial ? '글 수정' : '글쓰기'}</h2>
      <input placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
      <textarea placeholder="내용을 입력하세요" value={content} onChange={(e) => setContent(e.target.value)} rows={12} />
      <div className="row-right">
        <button type="button" className="btn outline" onClick={() => go(initial ? 'detail' : 'list', initial?.id)}>
          취소
        </button>
        <button type="submit" className="btn">{initial ? '수정 완료' : '등록'}</button>
      </div>
    </form>
  )
}

// ---------- 게시글 상세 ----------
function PostDetail({ post, user, go, onDelete, onAddComment, onDeleteComment }) {
  const [comment, setComment] = useState('')

  if (!post) {
    return (
      <div className="card">
        <p>존재하지 않는 게시글입니다.</p>
        <button className="btn" onClick={() => go('list')}>목록으로</button>
      </div>
    )
  }

  const isMine = user && user.id === post.authorId

  const submitComment = (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    onAddComment(post.id, comment.trim())
    setComment('')
  }

  return (
    <div className="card">
      <h2 className="detail-title">{post.title}</h2>
      <div className="meta">
        <span>{post.author}</span>
        <span>{formatDate(post.createdAt)}{post.updatedAt && ' (수정됨)'}</span>
        <span>조회 {post.views}</span>
      </div>
      <div className="content">{post.content}</div>

      <div className="row-right">
        <button className="btn outline" onClick={() => go('list')}>목록</button>
        {isMine && (
          <>
            <button className="btn outline" onClick={() => go('edit', post.id)}>수정</button>
            <button
              className="btn danger"
              onClick={() => {
                if (confirm('정말 삭제하시겠습니까?')) onDelete(post.id)
              }}
            >
              삭제
            </button>
          </>
        )}
      </div>

      <section className="comments">
        <h3>댓글 {post.comments.length}</h3>
        <ul>
          {post.comments.map((c) => (
            <li key={c.id}>
              <div className="c-head">
                <b>{c.author}</b>
                <span>{formatDate(c.createdAt)}</span>
                {user && user.id === c.authorId && (
                  <button className="link danger-text" onClick={() => onDeleteComment(post.id, c.id)}>
                    삭제
                  </button>
                )}
              </div>
              <p>{c.content}</p>
            </li>
          ))}
        </ul>

        {user ? (
          <form className="comment-form" onSubmit={submitComment}>
            <input placeholder="댓글을 입력하세요" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="btn" type="submit">등록</button>
          </form>
        ) : (
          <p className="sub">
            댓글을 작성하려면 <button className="link" onClick={() => go('login')}>로그인</button> 하세요.
          </p>
        )}
      </section>
    </div>
  )
}

// ---------- App ----------
function App() {
  const [users, setUsers] = useState(() => load('community_users', []))
  const [posts, setPosts] = useState(() => load('community_posts', []))
  const [user, setUser] = useState(() => load('community_session', null))
  const [view, setView] = useState({ page: 'list', id: null })

  useEffect(() => save('community_users', users), [users])
  useEffect(() => save('community_posts', posts), [posts])
  useEffect(() => save('community_session', user), [user])

  const go = (page, id = null) => {
    if ((page === 'write' || page === 'edit') && !user) {
      setView({ page: 'login', id: null })
      return
    }
    if (page === 'detail' && id !== null && view.page === 'list') {
      // 목록에서 들어올 때만 조회수 증가
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, views: p.views + 1 } : p)))
    }
    setView({ page, id })
    window.scrollTo(0, 0)
  }

  // --- 인증 ---
  const handleSignup = (newUser) => {
    setUsers((prev) => [...prev, newUser])
    alert('회원가입이 완료되었습니다. 로그인해 주세요.')
    go('login')
  }
  const handleLogin = (u) => {
    setUser({ id: u.id, nickname: u.nickname })
    go('list')
  }
  const handleLogout = () => {
    setUser(null)
    go('list')
  }

  // --- 게시글 ---
  const handleCreate = ({ title, content }) => {
    const nextNo = posts.reduce((max, p) => Math.max(max, p.no), 0) + 1
    const post = {
      id: Date.now(),
      no: nextNo,
      title,
      content,
      author: user.nickname,
      authorId: user.id,
      createdAt: Date.now(),
      updatedAt: null,
      views: 0,
      comments: [],
    }
    setPosts((prev) => [post, ...prev])
    setView({ page: 'detail', id: post.id })
  }
  const handleUpdate = ({ title, content }) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === view.id ? { ...p, title, content, updatedAt: Date.now() } : p)),
    )
    setView({ page: 'detail', id: view.id })
  }
  const handleDelete = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    go('list')
  }

  // --- 댓글 ---
  const handleAddComment = (postId, content) => {
    const c = { id: Date.now(), content, author: user.nickname, authorId: user.id, createdAt: Date.now() }
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, c] } : p)))
  }
  const handleDeleteComment = (postId, commentId) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) } : p)),
    )
  }

  const currentPost = posts.find((p) => p.id === view.id)

  let body
  switch (view.page) {
    case 'login':
      body = <Login users={users} onLogin={handleLogin} go={go} />
      break
    case 'signup':
      body = <Signup users={users} onSignup={handleSignup} go={go} />
      break
    case 'write':
      body = <PostForm onSubmit={handleCreate} go={go} />
      break
    case 'edit':
      body =
        currentPost && user && currentPost.authorId === user.id ? (
          <PostForm key={currentPost.id} initial={currentPost} onSubmit={handleUpdate} go={go} />
        ) : (
          <PostDetail post={currentPost} user={user} go={go} />
        )
      break
    case 'detail':
      body = (
        <PostDetail
          post={currentPost}
          user={user}
          go={go}
          onDelete={handleDelete}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      )
      break
    default:
      body = <PostList posts={posts} user={user} go={go} />
  }

  return (
    <div className="app">
      <Header user={user} go={go} onLogout={handleLogout} />
      <main className="main">{body}</main>
      <footer className="footer">© 2026 우리 커뮤니티</footer>
    </div>
  )
}

export default App
