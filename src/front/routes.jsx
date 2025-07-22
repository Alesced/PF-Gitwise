// File: src/front/routes.jsx

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { SinglePost } from "./pages/SinglePost";
import { Demo } from "./pages/Demo";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { AISearch } from "./pages/Posts";
import { PostForm } from "./pages/PostForm";
import { AdminPosts } from "./pages/AdminPosts";
import { UserProfile } from "./pages/UserProfile";
import { Contact } from "./pages/Contact";
import Free from "./pages/Free";
import Premium from "./pages/Premium";
import { SinglePost2 } from "./components/SinglePost2";
import { ErrorPage } from "./pages/ErrorPage"; // ✅ nueva página de error

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<ErrorPage />}>
      <Route path="/" element={<Home />} />
      <Route path="/single/:Id" element={<SinglePost2 />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/posts" element={<AISearch />} />
      <Route path="/post-form" element={<PostForm />} />
      <Route path="/admin" element={<AdminPosts />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/free" element={<Free />} />
      <Route path="/premium" element={<Premium />} />
    </Route>
  )
);