export default function LocationDetailHeaderInfo(props: {
  name: string | null;
  locationName: string | null;
  area: string | null;
  lastUpdated: string;
}) {
  return (
    <div id="info" className="px-4 pb-4 shadow">
      <h1
        className="text-dark text-lg sm:text-xl font-medium mt-3"
        x-text="$store.currentLocation.name"
        translate="no"
        id="location_name"
      >
        {props.name}
      </h1>

      <div className="mt-1">
        <p
          className="text-xs text-gray-500 mb-1"
          translate="no"
          x-text="$store.currentLocation.location_name"
        >
          {props.locationName}
        </p>
        <p className="flex items-center gap-x-1 text-xs text-gray-500">
          <span translate="no" className="truncate">
            {props.area}
          </span>
          <span className="text-green-600 truncate">✓</span>
          <span className="text-green-600 truncate">
            <span>
              <span>Validated&nbsp;</span>
              <span> {props.lastUpdated} </span>
            </span>
          </span>
        </p>
      </div>
    </div>
  );
}
