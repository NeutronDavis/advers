import React from "react";
import { requireStaff } from "@/lib/auth";
import { getAdminAdversPosts } from "@/server/data/posts";
import AdminPostsClient from "./AdminPostsClient";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  await requireStaff();
  const posts = await getAdminAdversPosts();
  return <AdminPostsClient posts={posts} />;
}
