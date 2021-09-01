import React from 'react';
import DiscoverBlock from './DiscoverBlock/components/DiscoverBlock';
import '../styles/_discover.scss';
import { useGetData } from '../../../hooks/hooks'

export default function Discover() {
  const { releases, featured, categories: cats } = useGetData();
  
  return (
    <div className="discover">
      {releases && <DiscoverBlock text="RELEASED THIS WEEK" id="released" data={releases} />}
      {featured && <DiscoverBlock text="FEATURED PLAYLISTS" id="featured" data={featured} />}
      {cats && <DiscoverBlock text="BROWSE" id="browse" data={cats} imagesKey="icons" />}
    </div>
  )
}
