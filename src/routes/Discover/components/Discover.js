import React from 'react';
import DiscoverBlock from './DiscoverBlock/components/DiscoverBlock';
import '../styles/_discover.scss';
import { useGetData } from '../../../hooks/hooks'

export default function Discover() {
  
  const { releases, featured, categories: cats } = useGetData();
  
  return (
    <div className="discover">
      {releases && <DiscoverBlock text="RELEASED THIS WEEK" id="released" data={releases.albums.items} />}
      {featured && <DiscoverBlock text="FEATURED PLAYLISTS" id="featured" data={featured.playlists.items} />}
      {cats && <DiscoverBlock text="BROWSE" id="browse" data={cats.categories.items} imagesKey="icons" />}
    </div>
  )
}
