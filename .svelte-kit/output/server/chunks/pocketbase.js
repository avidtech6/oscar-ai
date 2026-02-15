import PocketBase from "pocketbase";
const PB_URL = typeof window !== "undefined" ? localStorage.getItem("pb_url") || "http://localhost:8090" : "http://localhost:8090";
const pb = new PocketBase(PB_URL);
pb.authStore.model;
