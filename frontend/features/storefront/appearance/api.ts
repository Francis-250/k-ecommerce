export type AppearanceImage = {
  url: string;
  alt: string;
};

export type StorefrontAppearance = {
  logo: AppearanceImage;
  hero: AppearanceImage & {
    eyebrow: string;
    title: string;
    description: string;
    link: string;
    linkLabel: string;
  };
  promotions: [
    AppearanceImage & { link: string; label: string },
    AppearanceImage & { link: string; label: string },
  ];
  sidebar: {
    top: AppearanceImage;
    middle: AppearanceImage;
    bottom: AppearanceImage;
  };
  shopBanner: AppearanceImage;
};

type AppearanceResponse = {
  success: boolean;
  appearance: StorefrontAppearance;
  message?: string;
};

type UploadResponse = {
  success: boolean;
  image: { url: string };
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });
  const body = (await response.json().catch(() => ({}))) as T & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(body.message ?? "Storefront settings request failed");
  }

  return body;
}

export async function getStorefrontAppearance() {
  const response = await request<AppearanceResponse>(
    "/store-settings/storefront",
  );
  return response.appearance;
}

export async function updateStorefrontAppearance(
  appearance: StorefrontAppearance,
) {
  const response = await request<AppearanceResponse>(
    "/store-settings/storefront",
    {
      method: "PUT",
      body: JSON.stringify(appearance),
    },
  );
  return response.appearance;
}

function fileToDataUri(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read the image"));
    reader.readAsDataURL(file);
  });
}

export async function uploadStorefrontImage(file: File) {
  const dataUri = await fileToDataUri(file);
  const response = await request<UploadResponse>("/media/images", {
    method: "POST",
    body: JSON.stringify({
      dataUri,
      folder: "storefront",
      altText: file.name,
    }),
  });
  return response.image.url;
}
