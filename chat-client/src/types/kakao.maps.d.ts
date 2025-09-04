declare global {
  interface KakaoLatLng {
    getLat(): number;
    getLng(): number;
  }

  interface KakaoMapOptions {
    center: KakaoLatLng;
    level: number;
  }

  interface KakaoMap {
    setCenter(latlng: KakaoLatLng): void;
    getCenter(): KakaoLatLng;
    setLevel(level: number): void;
    getLevel(): number;
  }

  interface KakaoMarker {
    setMap(map: KakaoMap | null): void;
    getMap(): KakaoMap | null;
    setPosition(position: KakaoLatLng): void;
    getPosition(): KakaoLatLng;
  }

  interface KakaoInfoWindow {
    open(map: KakaoMap, marker: KakaoMarker): void;
    close(): void;
    setContent(content: string): void;
    getContent(): string;
  }

  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap;
        Marker: new (options: { position: KakaoLatLng }) => KakaoMarker;
        InfoWindow: new (options: { content: string }) => KakaoInfoWindow;
        services: {
          Geocoder: new () => {
            addressSearch: (
              address: string,
              callback: (
                result: {
                  address_name: string;
                  y: string;
                  x: string;
                  address_type: string;
                  address: string;
                  road_address: string;
                }[]
              ) => void
            ) => void;
          };
        };
      };
    };
  }
}

export {};
