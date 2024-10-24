import { env } from "~/env";

interface MapEmbedProps  {
    address: string
}

const MapEmbed = (props: MapEmbedProps) => {
    const { address } = props;
    const API_KEY = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    return (
        <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodeURIComponent(address)}`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        >
        </iframe>
    )
}

export default MapEmbed