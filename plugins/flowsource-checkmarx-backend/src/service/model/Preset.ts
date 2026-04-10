  
  interface Link {
    rel: string;
    uri: string;
  }

  interface Preset {
    queryIds: number[];
    id: number;
    name: string;
    ownerName: string;
    link: Link;
  }

  export default Preset;
  