'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowLeft, Download, Trash2, MoreVertical, Upload, Folder, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardPageHeader } from '@/components/dashboard-page-header';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Album {
  id: string;
  name: string;
  cover: string;
}

interface PhotoItem {
  id: string;
  albumId: string;
  title: string;
  url: string;
}

const INITIAL_ALBUMS: Album[] = [
  { id: 'alb-1', name: 'Family Memories', cover: 'https://images.pexels.com/photos/1648387/pexels-photo-1648387.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'alb-2', name: 'Childhood Photos', cover: 'https://images.pexels.com/photos/1648387/pexels-photo-1648387.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'alb-3', name: 'Travel Adventures', cover: 'https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'alb-4', name: 'Special Occasions', cover: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

const INITIAL_PHOTOS: PhotoItem[] = [
  { id: 'p1', albumId: 'alb-1', title: 'Family Picnic', url: 'https://images.pexels.com/photos/1648387/pexels-photo-1648387.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 'p2', albumId: 'alb-3', title: 'Mountain Hike', url: 'https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 'p3', albumId: 'alb-4', title: 'Birthday Party', url: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 'p4', albumId: 'alb-3', title: 'Summer Trip', url: 'https://images.pexels.com/photos/7923812/pexels-photo-7923812.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 'p5', albumId: 'alb-2', title: 'Graduation Day', url: 'https://images.pexels.com/photos/1488318/pexels-photo-1488318.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 'p6', albumId: 'alb-3', title: 'Beach Sunset', url: 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 'p7', albumId: 'alb-1', title: 'Holiday Reunion', url: 'https://images.pexels.com/photos/1024349/pexels-photo-1024349.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { id: 'p8', albumId: 'alb-4', title: 'Anniversary', url: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=300' },
];

export default function PhotoVaultPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showAlbumDialog, setShowAlbumDialog] = useState(false);

  const [photoTitle, setPhotoTitle] = useState('');
  const [targetAlbumId, setTargetAlbumId] = useState<string>('alb-1');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [albumName, setAlbumName] = useState('');

  useEffect(() => {
    const rawAlbums = localStorage.getItem('legacy_photo_albums');
    const rawPhotos = localStorage.getItem('legacy_photos');

    if (rawAlbums) try { setAlbums(JSON.parse(rawAlbums)); } catch {} else setAlbums(INITIAL_ALBUMS);
    if (rawPhotos) try { setPhotos(JSON.parse(rawPhotos)); } catch {} else setPhotos(INITIAL_PHOTOS);
  }, []);

  const saveAlbums = (newAlbums: Album[]) => {
    setAlbums(newAlbums);
    localStorage.setItem('legacy_photo_albums', JSON.stringify(newAlbums));
  };

  const savePhotos = (newPhotos: PhotoItem[]) => {
    setPhotos(newPhotos);
    localStorage.setItem('legacy_photos', JSON.stringify(newPhotos));
  };

  const handleImageUpload = () => {
    if (!selectedImage && !photoTitle) return;
    const destAlbum = activeAlbumId || targetAlbumId || (albums[0]?.id ?? 'alb-1');

    if (selectedImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newP: PhotoItem = {
          id: Date.now().toString(),
          albumId: destAlbum,
          title: photoTitle || selectedImage.name,
          url: dataUrl,
        };
        savePhotos([newP, ...photos]);
        setShowUploadDialog(false);
        setPhotoTitle('');
        setSelectedImage(null);
      };
      reader.readAsDataURL(selectedImage);
    } else {
      const newP: PhotoItem = {
        id: Date.now().toString(),
        albumId: destAlbum,
        title: photoTitle,
        url: 'https://images.pexels.com/photos/1648387/pexels-photo-1648387.jpeg?auto=compress&cs=tinysrgb&w=300',
      };
      savePhotos([newP, ...photos]);
      setShowUploadDialog(false);
      setPhotoTitle('');
    }
  };

  const handleCreateAlbum = () => {
    if (!albumName) return;
    const newAlbId = `alb-${Date.now()}`;
    const newAlb: Album = {
      id: newAlbId,
      name: albumName,
      cover: 'https://images.pexels.com/photos/1648387/pexels-photo-1648387.jpeg?auto=compress&cs=tinysrgb&w=400',
    };
    saveAlbums([...albums, newAlb]);
    setShowAlbumDialog(false);
    setAlbumName('');
    setActiveAlbumId(newAlbId);
  };

  const handleDeleteAlbum = (id: string) => {
    saveAlbums(albums.filter((a) => a.id !== id));
    savePhotos(photos.filter((p) => p.albumId !== id));
    if (activeAlbumId === id) {
      setActiveAlbumId(null);
    }
  };

  const handleDeletePhoto = (id: string) => {
    savePhotos(photos.filter((p) => p.id !== id));
  };

  const activeAlbum = albums.find((a) => a.id === activeAlbumId);
  const displayedPhotos = activeAlbumId
    ? photos.filter((p) => p.albumId === activeAlbumId)
    : photos;

  return (
    <div>
      {activeAlbumId && activeAlbum ? (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => setActiveAlbumId(null)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Albums
            </Button>
          </div>
          <DashboardPageHeader
            title={activeAlbum.name}
            description={`Viewing photos inside "${activeAlbum.name}" (${displayedPhotos.length} photos)`}
            action={
              <div className="flex gap-2">
                <Button className="shadow-glow" size="lg" onClick={() => setShowUploadDialog(true)}>
                  <Upload className="mr-2 h-4 w-4" /> Upload Photos
                </Button>
                <Button variant="destructive" size="lg" onClick={() => handleDeleteAlbum(activeAlbum.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Album
                </Button>
              </div>
            }
          />
        </div>
      ) : (
        <div>
          <DashboardPageHeader
            title="Photo Vault"
            description="Preserve and organize your cherished family memories into albums."
            action={
              <Button className="shadow-glow" size="lg" onClick={() => setShowUploadDialog(true)}>
                <Upload className="mr-2 h-4 w-4" /> Upload Photos
              </Button>
            }
          />

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Albums ({albums.length})</h2>
            <Button variant="outline" size="sm" onClick={() => setShowAlbumDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Album
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {albums.map((album, i) => {
              const albumPhotosCount = photos.filter((p) => p.albumId === album.id).length;
              return (
                <motion.div
                  key={album.id || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    onClick={() => setActiveAlbumId(album.id)}
                    className="group overflow-hidden cursor-pointer hover:shadow-elevated transition-all border border-border/60 hover:border-primary/50"
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img src={album.cover} alt={album.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-2 text-white">
                          <Folder className="h-4 w-4" />
                          <span className="font-semibold text-sm truncate">{album.name}</span>
                        </div>
                        <p className="text-xs text-white/80">{albumPhotosCount} photos · Click to open</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={() => setShowAlbumDialog(true)}
                className="w-full aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">New Album</span>
              </button>
            </motion.div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {activeAlbumId ? `Photos in Album (${displayedPhotos.length})` : `All Photos (${photos.length})`}
        </h2>
      </div>

      {displayedPhotos.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-semibold text-base mb-1">No photos in this album yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Upload your first photo to start building this collection.</p>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload Photo Now
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedPhotos.map((photo, i) => (
            <motion.div
              key={photo.id || i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="group relative aspect-square rounded-xl overflow-hidden border border-border/50"
            >
              <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <a href={photo.url} download={`${photo.title || 'photo'}.jpg`}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeletePhoto(photo.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium truncate drop-shadow">
                {photo.title}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Photos</DialogTitle>
            <DialogDescription>Add a photo memory to your vault.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Target Album</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={activeAlbumId || targetAlbumId}
                onChange={(e) => setTargetAlbumId(e.target.value)}
              >
                {albums.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Photo Title</Label>
              <Input placeholder="e.g. Summer Vacation, Family Reunion" value={photoTitle} onChange={(e) => setPhotoTitle(e.target.value)} />
            </div>
            <div>
              <Label>Select Image File</Label>
              <Input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
            <Button onClick={handleImageUpload} disabled={!selectedImage && !photoTitle}>Upload Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAlbumDialog} onOpenChange={setShowAlbumDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Album</DialogTitle>
            <DialogDescription>Group your photos by events or memory topics.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Album Name</Label>
              <Input placeholder="e.g. Wedding 2025, Family Trips" value={albumName} onChange={(e) => setAlbumName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlbumDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateAlbum} disabled={!albumName}>Create Album</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
