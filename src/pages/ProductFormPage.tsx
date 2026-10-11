import { ArrowLeft, ImagePlus, Save, UploadCloud, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { Button, Input, Select, Textarea } from "../components/ui"
import { useProducts } from "../hooks/useProducts"
import { saveProduct, uploadMedia } from "../services/products"
import type { ProductInput } from "../types/product"

const blank: ProductInput = {
  name: "",
  price: 0,
  category: "Phones",
  shortDescription: "",
  description: "",
  images: [],
  videoUrl: "",
  available: true,
  featured: false,
  isNew: false,
  specifications: {},
}

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, loading } = useProducts()
  const existing = products.find((item) => item.id === id)
  const [form, setForm] = useState<ProductInput>(blank)
  const [pendingImages, setPendingImages] = useState<{
    file: File
    previewUrl: string
  }[]>([])
  const [pendingVideo, setPendingVideo] = useState<{
    file: File
    previewUrl: string
  } | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [specs, setSpecs] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const previewUrls = useRef(new Set<string>())
  const imageInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)

  useEffect(
    () => () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url))
      previewUrls.current.clear()
    },
    [],
  )

  useEffect(() => {
    if (existing) {
      const {
        id: _id,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...input
      } = existing
      setForm(input)
      setSpecs(
        Object.entries(existing.specifications)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n"),
      )
    }
  }, [existing])

  function change<K extends keyof ProductInput>(
    key: K,
    value: ProductInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }
  function addImageUrl() {
    if (imageUrl.trim()) {
      change("images", [...form.images, imageUrl.trim()])
      setImageUrl("")
    }
  }
  function makePreview(file: File) {
    const previewUrl = URL.createObjectURL(file)
    previewUrls.current.add(previewUrl)
    return { file, previewUrl }
  }
  function removePreview(url: string) {
    URL.revokeObjectURL(url)
    previewUrls.current.delete(url)
  }
  function filesSelected(files: File[], video = false) {
    if (!files?.length) return
    setError("")
    if (video) {
      if (pendingVideo) removePreview(pendingVideo.previewUrl)
      setPendingVideo(makePreview(files[0]))
    } else {
      setPendingImages((current) => [...current, ...files.map(makePreview)])
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    if (!form.name.trim()) return setError("Product name is required.")
    if (form.price <= 0) return setError("Price must be greater than zero.")
    if (!form.images.length && !pendingImages.length)
      return setError("Add at least one product image.")
    setBusy(true)
    try {
      const specifications = Object.fromEntries(
        specs
          .split("\n")
          .map((line) => line.split(":").map((part) => part.trim()))
          .filter((parts) => parts.length >= 2 && parts[0])
          .map(([key, ...values]) => [key, values.join(": ")]),
      )
      const uploadedImages = await Promise.all(
        pendingImages.map(({ file }) => uploadMedia(file)),
      )
      const videoUrl = pendingVideo
        ? await uploadMedia(pendingVideo.file)
        : form.videoUrl
      await saveProduct(
        {
          ...form,
          images: [...form.images, ...uploadedImages],
          videoUrl,
          specifications,
        },
        id,
      )
      navigate("/admin")
    } catch (saveError) {
      console.error("Product save failed.", saveError)
      setError(
        "We couldn't save this product. Check that Firebase Storage is enabled, the configured bucket exists, and your connection is working.",
      )
    } finally {
      setBusy(false)
    }
  }

  if (id && loading) return <p>Loading product…</p>
  if (id && !loading && !existing) return <p>Product not found.</p>
  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-sm font-bold text-muted"
      >
        <ArrowLeft className="size-4" /> Back to catalog
      </Link>
      <div className="mt-6">
        <p className="text-xs font-black uppercase tracking-widest text-emerald">
          {id ? "Edit product" : "New product"}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold">
          {id ? existing?.name : "Add to your catalog."}
        </h1>
      </div>
      <form
        onSubmit={submit}
        className="mt-9 grid gap-6 lg:grid-cols-[1fr_20rem]"
      >
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="font-display text-xl font-semibold">
              Product details
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold">
                  Product name *
                </span>
                <Input
                  value={form.name}
                  onChange={(event) => change("name", event.target.value)}
                  required
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold">
                  Price (TZS) *
                </span>
                <Input
                  type="number"
                  min="1"
                  value={form.price || ""}
                  onChange={(event) =>
                    change("price", Number(event.target.value))
                  }
                  required
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold">Category *</span>
                <Select
                  value={form.category}
                  onChange={(event) =>
                    change(
                      "category",
                      event.target.value as ProductInput["category"],
                    )
                  }
                >
                  <option>Phones</option>
                  <option>Accessories</option>
                </Select>
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold">
                  Short description
                </span>
                <Input
                  maxLength={140}
                  value={form.shortDescription}
                  onChange={(event) =>
                    change("shortDescription", event.target.value)
                  }
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold">
                  Full description
                </span>
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    change("description", event.target.value)
                  }
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold">
                  Specifications
                </span>
                <Textarea
                  value={specs}
                  onChange={(event) => setSpecs(event.target.value)}
                  placeholder={
                    "One per line, for example:\nStorage: 256GB\nBattery: 5,000mAh"
                  }
                />
              </label>
            </div>
          </section>
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="font-display text-xl font-semibold">Media</h2>
            <p className="mt-1 text-sm text-muted">
              Add optimized images or a short product video.
            </p>
            <p className="mt-1 text-sm text-muted">
              Selected files upload when you click Save product.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {form.images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-mist"
                >
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Remove image ${index + 1}`}
                    onClick={() =>
                      change(
                        "images",
                        form.images.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      )
                    }
                    className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white text-red-600 shadow"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              {pendingImages.map(({ previewUrl }, index) => (
                <div
                  key={previewUrl}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-mist"
                >
                  <img
                    src={previewUrl}
                    alt={`Selected image ${index + 1}`}
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Remove selected image ${index + 1}`}
                    onClick={() => {
                      removePreview(previewUrl)
                      setPendingImages((current) =>
                        current.filter(
                          (image) => image.previewUrl !== previewUrl,
                        ),
                      )
                    }}
                    className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white text-red-600 shadow"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => imageInput.current?.click()}
                className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-mist text-center text-sm font-bold text-muted hover:border-navy"
              >
                <ImagePlus className="mb-2 size-6" /> Choose images
              </button>
              <input
                ref={imageInput}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => {
                  filesSelected(Array.from(event.currentTarget.files ?? []))
                  event.currentTarget.value = ""
                }}
              />
            </div>
            {pendingImages.length > 0 && (
              <p className="mt-3 text-sm text-emerald">
                {pendingImages.length} image
                {pendingImages.length === 1 ? "" : "s"} selected and ready to
                save.
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <Input
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="Or paste an image URL"
              />
              <Button type="button" variant="ghost" onClick={addImageUrl}>
                Add
              </Button>
            </div>
            <button
              type="button"
              onClick={() => videoInput.current?.click()}
              className="mt-4 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-line p-4 text-left text-sm font-bold hover:bg-mist"
            >
              <UploadCloud className="size-5 text-emerald" />{" "}
              {pendingVideo || form.videoUrl
                ? "Replace product video"
                : "Upload optional product video"}
            </button>
            <input
              ref={videoInput}
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={(event) => {
                filesSelected(Array.from(event.currentTarget.files ?? []), true)
                event.currentTarget.value = ""
              }}
            />
            {(pendingVideo || form.videoUrl) && (
              <video
                src={pendingVideo?.previewUrl ?? form.videoUrl}
                controls
                className="mt-3 max-h-52 w-full rounded-xl bg-navy"
              />
            )}
            {pendingVideo && (
              <button
                type="button"
                onClick={() => {
                  removePreview(pendingVideo.previewUrl)
                  setPendingVideo(null)
                }}
                className="mt-2 text-sm font-bold text-red-600"
              >
                Remove selected video
              </button>
            )}
          </section>
        </div>
        <aside className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="font-display text-xl font-semibold">Visibility</h2>
            <label className="mt-5 flex items-center justify-between gap-4 text-sm font-bold">
              Available{" "}
              <input
                type="checkbox"
                checked={form.available}
                onChange={(event) => change("available", event.target.checked)}
                className="size-5 accent-emerald"
              />
            </label>
            <label className="mt-5 flex items-center justify-between gap-4 text-sm font-bold">
              Featured{" "}
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => change("featured", event.target.checked)}
                className="size-5 accent-emerald"
              />
            </label>
            <label className="mt-5 flex items-center justify-between gap-4 text-sm font-bold">
              New arrival{" "}
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(event) => change("isNew", event.target.checked)}
                className="size-5 accent-emerald"
              />
            </label>
          </section>
          {error && (
            <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          )}
          <Button className="w-full" disabled={busy}>
            <Save className="size-4" /> {busy ? "Saving…" : "Save product"}
          </Button>
        </aside>
      </form>
    </div>
  )
}
