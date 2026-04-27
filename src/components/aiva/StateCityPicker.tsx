import { useMemo, useState } from "react";
import { MapPin, ChevronLeft, Search } from "lucide-react";

interface StateCityPickerProps {
  onSubmit: (address: string) => void;
}

// Curated list of US states + a handful of major cities for each. Demo data.
const STATE_CITIES: Record<string, string[]> = {
  "Alabama": ["Birmingham", "Montgomery", "Mobile", "Huntsville"],
  "Alaska": ["Anchorage", "Fairbanks", "Juneau"],
  "Arizona": ["Phoenix", "Tucson", "Mesa", "Scottsdale", "Flagstaff"],
  "Arkansas": ["Little Rock", "Fayetteville", "Fort Smith"],
  "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose", "Oakland", "Long Beach", "Fresno"],
  "Colorado": ["Denver", "Colorado Springs", "Boulder", "Aurora"],
  "Connecticut": ["Hartford", "New Haven", "Stamford", "Bridgeport"],
  "Delaware": ["Wilmington", "Dover", "Newark"],
  "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee", "Fort Lauderdale"],
  "Georgia": ["Atlanta", "Savannah", "Augusta", "Athens"],
  "Hawaii": ["Honolulu", "Hilo", "Kailua"],
  "Idaho": ["Boise", "Idaho Falls", "Coeur d'Alene"],
  "Illinois": ["Chicago", "Springfield", "Naperville", "Aurora"],
  "Indiana": ["Indianapolis", "Fort Wayne", "Bloomington"],
  "Iowa": ["Des Moines", "Cedar Rapids", "Iowa City"],
  "Kansas": ["Wichita", "Topeka", "Kansas City", "Overland Park"],
  "Kentucky": ["Louisville", "Lexington", "Bowling Green"],
  "Louisiana": ["New Orleans", "Baton Rouge", "Shreveport"],
  "Maine": ["Portland", "Augusta", "Bangor"],
  "Maryland": ["Baltimore", "Annapolis", "Rockville", "Frederick"],
  "Massachusetts": ["Boston", "Cambridge", "Worcester", "Springfield"],
  "Michigan": ["Detroit", "Grand Rapids", "Ann Arbor", "Lansing"],
  "Minnesota": ["Minneapolis", "Saint Paul", "Rochester", "Duluth"],
  "Mississippi": ["Jackson", "Gulfport", "Biloxi"],
  "Missouri": ["Kansas City", "St. Louis", "Springfield", "Columbia"],
  "Montana": ["Billings", "Missoula", "Bozeman"],
  "Nebraska": ["Omaha", "Lincoln", "Bellevue"],
  "Nevada": ["Las Vegas", "Reno", "Henderson", "Carson City"],
  "New Hampshire": ["Manchester", "Nashua", "Concord"],
  "New Jersey": ["Newark", "Jersey City", "Trenton", "Princeton"],
  "New Mexico": ["Albuquerque", "Santa Fe", "Las Cruces"],
  "New York": ["New York City", "Buffalo", "Rochester", "Albany", "Syracuse"],
  "North Carolina": ["Charlotte", "Raleigh", "Durham", "Asheville", "Greensboro"],
  "North Dakota": ["Fargo", "Bismarck", "Grand Forks"],
  "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo"],
  "Oklahoma": ["Oklahoma City", "Tulsa", "Norman"],
  "Oregon": ["Portland", "Eugene", "Salem", "Bend"],
  "Pennsylvania": ["Philadelphia", "Pittsburgh", "Harrisburg", "Allentown"],
  "Rhode Island": ["Providence", "Newport", "Warwick"],
  "South Carolina": ["Charleston", "Columbia", "Greenville"],
  "South Dakota": ["Sioux Falls", "Rapid City", "Pierre"],
  "Tennessee": ["Nashville", "Memphis", "Knoxville", "Chattanooga"],
  "Texas": ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso"],
  "Utah": ["Salt Lake City", "Provo", "Park City"],
  "Vermont": ["Burlington", "Montpelier"],
  "Virginia": ["Richmond", "Virginia Beach", "Arlington", "Alexandria", "Vienna", "McLean"],
  "Washington": ["Seattle", "Spokane", "Tacoma", "Olympia", "Bellevue"],
  "West Virginia": ["Charleston", "Huntington", "Morgantown"],
  "Wisconsin": ["Milwaukee", "Madison", "Green Bay"],
  "Wyoming": ["Cheyenne", "Casper", "Jackson"],
  "District of Columbia": ["Washington"],
};

const STATES = Object.keys(STATE_CITIES);

export const StateCityPicker = ({ onSubmit }: StateCityPickerProps) => {
  const [step, setStep] = useState<"state" | "city">("state");
  const [state, setState] = useState<string | null>(null);
  const [stateQuery, setStateQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");

  const filteredStates = useMemo(() => {
    const q = stateQuery.trim().toLowerCase();
    if (!q) return STATES;
    return STATES.filter((s) => s.toLowerCase().includes(q));
  }, [stateQuery]);

  const cities = state ? STATE_CITIES[state] : [];
  const filteredCities = useMemo(() => {
    const q = cityQuery.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => c.toLowerCase().includes(q));
  }, [cityQuery, cities]);

  return (
    <div className="flex-1 flex flex-col bg-white text-aiva-navy anim-fade-up">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2 shrink-0">
        <button
          onClick={() => {
            if (step === "city") {
              setStep("state");
              setState(null);
              setCityQuery("");
            }
          }}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
            step === "city" ? "text-foreground hover:bg-aiva-bot-bg" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
            Step {step === "state" ? "1" : "2"} of 2
          </div>
          <div className="text-base font-bold">
            {step === "state" ? "Select your state" : `Cities in ${state}`}
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-aiva-blue-deep/10 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-aiva-blue-deep" />
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3 shrink-0">
        <div className="flex items-center gap-2 border border-border rounded-full px-4 py-2.5 bg-aiva-bot-bg">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={step === "state" ? stateQuery : cityQuery}
            onChange={(e) =>
              step === "state" ? setStateQuery(e.target.value) : setCityQuery(e.target.value)
            }
            placeholder={step === "state" ? "Search states…" : "Search cities…"}
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-5 scrollbar-hide">
        {step === "state" ? (
          <ul className="space-y-1">
            {filteredStates.map((s) => (
              <li key={s}>
                <button
                  onClick={() => {
                    setState(s);
                    setStep("city");
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-aiva-bot-bg transition flex items-center justify-between text-sm font-medium"
                >
                  <span>{s}</span>
                  <span className="text-muted-foreground text-xs">
                    {STATE_CITIES[s].length} {STATE_CITIES[s].length === 1 ? "city" : "cities"}
                  </span>
                </button>
              </li>
            ))}
            {filteredStates.length === 0 && (
              <li className="text-sm text-muted-foreground text-center py-8">No states match.</li>
            )}
          </ul>
        ) : (
          <ul className="space-y-1">
            {filteredCities.map((c) => (
              <li key={c}>
                <button
                  onClick={() => onSubmit(`${c}, ${state}`)}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-aiva-bot-bg transition text-sm font-medium"
                >
                  {c}
                </button>
              </li>
            ))}
            {filteredCities.length === 0 && (
              <li className="text-sm text-muted-foreground text-center py-8">
                No cities match. Try a different search.
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};
