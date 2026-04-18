import { useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, SlidersHorizontal, X, Sparkles, UserSearch, Dumbbell, ChevronRight, TrendingUp, Globe, Star } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { getCurrencySymbol } from "@/lib/utils";
import { API_BASE } from "@/lib/queryClient";

const ALL_SPECIALTIES = [
  "Strength Training", "Fat Loss", "Hypertrophy", "HIIT",
  "Yoga", "Powerlifting", "Nutrition Coaching", "Bodybuilding",
  "Rehab & Mobility", "Sports Performance",
];

const TRENDING_SPECIALTIES = [
  "Fat Loss", "Strength Training", "Hypertrophy", "Rehab & Mobility", "Sports Performance", "Nutrition Coaching",
];

const POPULAR_LOCATIONS = [
  { label: "London", type: "city" as const },
  { label: "Manchester", type: "city" as const },
  { label: "Dublin", type: "city" as const },
  { label: "Berlin", type: "city" as const },
  { label: "New York", type: "city" as const },
  { label: "Online Trainers", type: "online" as const },
];

const COUNTRIES = [
  "United Kingdom", "Ireland", "France", "Germany", "United States", "Canada",
];

type CoachingModeFilter = "" | "ONLINE" | "IN_PERSON" | "HYBRID";

export default function Explore() {
  const [searchInput, setSearchInput] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [coachingMode, setCoachingMode] = useState<CoachingModeFilter>("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
  const [language, setLanguage] = useState("");
  const [sort, setSort] = useState("recommended");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchInput, 400);

  const priceFilterActive = priceRange[0] > 0 || priceRange[1] < 300;

  const hasActiveFilters = useMemo(() =>
    debouncedSearch || city || country || coachingMode || selectedSpecialties.length > 0 || priceFilterActive || language,
    [debouncedSearch, city, country, coachingMode, selectedSpecialties, priceFilterActive, language]
  );

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "12" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (city) params.set("city", city);
    if (country) params.set("country", country);
    if (coachingMode) params.set("coachingMode", coachingMode);
    if (selectedSpecialties.length > 0) params.set("specialties", selectedSpecialties.join(","));
    if (priceRange[0] > 0) params.set("priceMin", String(priceRange[0]));
    if (priceRange[1] < 300) params.set("priceMax", String(priceRange[1]));
    if (language) params.set("language", language);
    if (sort !== "recommended") params.set("sort", sort);
    return params;
  }, [debouncedSearch, city, country, coachingMode, selectedSpecialties, priceRange, language, sort, page]);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/trainers", queryParams.toString()],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/trainers?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to load trainers");
      return res.json();
    },
  });

  const trainers = data?.trainers || [];
  const total = data?.total || 0;

  const clearAllFilters = () => {
    setSearchInput(""); setCity(""); setCountry(""); setCoachingMode("");
    setSelectedSpecialties([]); setPriceRange([0, 300]); setLanguage("");
    setSort("recommended"); setPage(1);
  };

  const setOnlineOnly = () => { setCoachingMode("ONLINE"); setPage(1); };

  const toggleSpecialty = (spec: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
    setPage(1);
  };

  const applyLocation = (loc: typeof POPULAR_LOCATIONS[0]) => {
    if (loc.type === "online") {
      setCoachingMode("ONLINE");
      setCity("");
    } else {
      setCity(loc.label);
      setCoachingMode("");
    }
    setPage(1);
  };

  const activeFilterChips: { label: string; onRemove: () => void }[] = [];
  if (debouncedSearch) activeFilterChips.push({ label: `"${debouncedSearch}"`, onRemove: () => setSearchInput("") });
  if (city) activeFilterChips.push({ label: city, onRemove: () => { setCity(""); setPage(1); } });
  if (country) activeFilterChips.push({ label: country, onRemove: () => { setCountry(""); setPage(1); } });
  if (coachingMode) activeFilterChips.push({
    label: coachingMode === "ONLINE" ? "Online" : coachingMode === "IN_PERSON" ? "In-Person" : "Hybrid",
    onRemove: () => { setCoachingMode(""); setPage(1); },
  });
  selectedSpecialties.forEach(spec =>
    activeFilterChips.push({ label: spec, onRemove: () => toggleSpecialty(spec) })
  );
  if (priceFilterActive) activeFilterChips.push({
    label: `$${priceRange[0]} – $${priceRange[1]}${priceRange[1] >= 300 ? "+" : ""}`,
    onRemove: () => { setPriceRange([0, 300]); setPage(1); },
  });
  if (language) activeFilterChips.push({ label: language, onRemove: () => { setLanguage(""); setPage(1); } });

  const FiltersPanel = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-semibold mb-2 text-foreground uppercase tracking-wider">Location</h3>
        <div className="space-y-2">
          <Select value={country} onValueChange={v => { setCountry(v === "any" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full h-9 rounded-xl text-sm" data-testid="select-country">
              <SelectValue placeholder="Any Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Country</SelectItem>
              {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            placeholder="City"
            value={city}
            onChange={e => { setCity(e.target.value); setPage(1); }}
            className="h-9 rounded-xl text-sm"
            data-testid="input-city"
            aria-label="Search by city"
          />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold mb-2 text-foreground uppercase tracking-wider">Coaching Mode</h3>
        <div className="flex flex-wrap gap-1.5">
          {([["", "Any"], ["ONLINE", "Online"], ["IN_PERSON", "In-Person"], ["HYBRID", "Hybrid"]] as [CoachingModeFilter, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => { setCoachingMode(value); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                coachingMode === value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              }`}
              data-testid={`filter-mode-${value || "any"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold mb-2 text-foreground uppercase tracking-wider">Specialty</h3>
        <div className="flex flex-wrap gap-1.5">
          {ALL_SPECIALTIES.map(spec => (
            <button
              key={spec}
              onClick={() => toggleSpecialty(spec)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                selectedSpecialties.includes(spec)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              }`}
              data-testid={`filter-specialty-${spec}`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold mb-2 text-foreground uppercase tracking-wider">Price / session</h3>
        <Slider
          value={priceRange}
          onValueChange={v => { setPriceRange(v as [number, number]); setPage(1); }}
          min={0} max={300} step={10}
          className="mb-2"
          data-testid="slider-price"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}{priceRange[1] >= 300 ? "+" : ""}</span>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold mb-2 text-foreground uppercase tracking-wider">Language</h3>
        <Select value={language} onValueChange={v => { setLanguage(v === "any" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-full h-9 rounded-xl text-sm" data-testid="select-language">
            <SelectValue placeholder="Any Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Language</SelectItem>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Spanish">Spanish</SelectItem>
            <SelectItem value="French">French</SelectItem>
            <SelectItem value="German">German</SelectItem>
            <SelectItem value="Mandarin">Mandarin</SelectItem>
            <SelectItem value="Irish">Irish</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="w-full text-muted-foreground hover:text-foreground text-xs" data-testid="button-clear-all-sidebar">
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="border-b">
        <div className="container mx-auto px-4 md:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">Explore Trainers</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Find the perfect coach for your fitness journey.</p>
            </div>
            <div className="flex w-full md:w-auto items-center gap-2">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, city..."
                  className="pl-9 bg-background border-border shadow-sm rounded-xl h-9 text-sm"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  data-testid="input-search"
                  aria-label="Search trainers by name or city"
                />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden h-9 w-9 rounded-xl shrink-0" data-testid="button-mobile-filters" aria-label="Open filters menu">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] overflow-y-auto">
                  <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                  <div className="mt-4"><FiltersPanel /></div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-5">
        <div className="flex gap-6">
          <aside className="hidden md:block w-60 shrink-0">
            <div className="rounded-2xl border border-border p-4 sticky top-20">
              <h2 className="font-semibold text-xs uppercase tracking-wider mb-3 text-muted-foreground">Filters</h2>
              <FiltersPanel />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {activeFilterChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-3" data-testid="filter-chips-row">
                {activeFilterChips.map((chip, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {chip.label}
                    <button onClick={chip.onRemove} className="hover:bg-primary/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground underline ml-1" data-testid="button-clear-all-chips">
                  Clear all
                </button>
              </div>
            )}

            <div className="mb-4" data-testid="trending-row">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trending</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TRENDING_SPECIALTIES.map(spec => (
                  <button
                    key={spec}
                    onClick={() => toggleSpecialty(spec)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selectedSpecialties.includes(spec)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                    }`}
                    data-testid={`trending-${spec}`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-semibold" data-testid="text-results-heading">
                  {hasActiveFilters ? "Results" : (
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      Recommended trainers
                    </span>
                  )}
                </h2>
                <p className="text-xs text-muted-foreground" data-testid="text-trainer-count">
                  {isLoading ? "Loading..." : `${total} trainer${total !== 1 ? "s" : ""} found`}
                </p>
              </div>
              <Select value={sort} onValueChange={v => { setSort(v); setPage(1); }}>
                <SelectTrigger className="w-[150px] h-8 rounded-lg bg-background text-xs" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : trainers.length === 0 && hasActiveFilters ? (
              <div className="space-y-5">
                <div className="text-center py-10 px-4 border rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <UserSearch className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-bold mb-1" data-testid="text-empty-title">No trainers match these filters</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-5">
                    Try clearing filters, expanding your price range, or switching to Online coaching.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button onClick={clearAllFilters} size="sm" className="rounded-xl" data-testid="button-clear-filters-empty">Clear all filters</Button>
                    <Button variant="outline" size="sm" onClick={setOnlineOnly} className="rounded-xl" data-testid="button-show-online">Show Online Trainers</Button>
                    <Link href="/auth">
                      <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground" data-testid="link-become-trainer">
                        Become a Trainer <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <PopularLocations onApply={applyLocation} />
              </div>
            ) : trainers.length === 0 ? (
              <div className="space-y-5">
                <div className="text-center py-10 px-4 border rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Dumbbell className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-bold mb-1" data-testid="text-no-trainers-title">No trainers yet</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-5">
                    Be the first trainer in your city — it's free to create a profile.
                  </p>
                  <Link href="/auth">
                    <Button size="sm" className="rounded-xl" data-testid="button-become-trainer-empty">
                      Become a Trainer <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
                <PopularLocations onApply={applyLocation} />
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trainers.map((trainer: any) => <TrainerCard key={trainer.id} trainer={trainer} />)}
                </div>
                {trainers.length < total && (
                  <div className="mt-8 flex justify-center">
                    <Button variant="outline" className="rounded-full px-8" onClick={() => setPage(p => p + 1)} data-testid="button-load-more">Load More</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function PopularLocations({ onApply }: { onApply: (loc: typeof POPULAR_LOCATIONS[0]) => void }) {
  return (
    <div className="border rounded-2xl p-4" data-testid="popular-locations">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Popular Locations</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {POPULAR_LOCATIONS.map(loc => (
          <button
            key={loc.label}
            onClick={() => onApply(loc)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
            data-testid={`location-${loc.label}`}
          >
            {loc.type === "online" ? <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
            {loc.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-4 space-y-2.5">
        <div className="flex gap-2">
          <div className="h-4 w-14 bg-muted rounded" />
          <div className="h-4 w-18 bg-muted rounded" />
        </div>
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-9 w-full bg-muted rounded-xl mt-3" />
      </div>
    </div>
  );
}

function TrainerCard({ trainer }: { trainer: any }) {
  const coachingLabel = trainer.coachingMode === "ONLINE" ? "Online" : trainer.coachingMode === "IN_PERSON" ? "In-Person" : "Hybrid";
  const specialties = trainer.specialties || [];
  const visibleSpecs = specialties.slice(0, 3);
  const extraCount = specialties.length - 3;
  const currency = getCurrencySymbol(trainer.country || "");

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col group" data-testid={`card-trainer-${trainer.id}`}>
      <Link href={`/profile/${trainer.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {trainer.image ? (
          <img
            src={trainer.image}
            alt={trainer.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {trainer.name?.charAt(0) || "T"}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
        <div className="absolute top-2.5 left-2.5">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur text-foreground font-medium border-none shadow-sm text-[11px] px-2 py-0.5">
            {coachingLabel}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-base font-bold tracking-tight mb-0.5" data-testid={`text-trainer-name-${trainer.id}`}>{trainer.name}</h3>
          <div className="flex items-center text-xs text-white/80">
            <MapPin className="w-3 h-3 mr-1" />
            {trainer.city}{trainer.country ? `, ${trainer.country}` : ""}
          </div>
        </div>
      </Link>
      <div className="p-3.5 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1 mb-2.5">
          {visibleSpecs.map((spec: string) => (
            <span key={spec} className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[11px] font-medium rounded">{spec}</span>
          ))}
          {extraCount > 0 && (
            <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[11px] font-medium rounded">+{extraCount}</span>
          )}
        </div>
        {Number(trainer.reviewCount) > 0 && (
          <div className="flex items-center gap-1 mb-1.5 text-xs text-muted-foreground">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-foreground">{Number(trainer.averageRating).toFixed(1)}</span>
            <span>({trainer.reviewCount})</span>
          </div>
        )}
        <p className="text-sm font-medium mt-auto text-foreground/80" data-testid={`text-price-${trainer.id}`}>
          {currency}{trainer.priceMin} – {currency}{trainer.priceMax} <span className="font-normal text-muted-foreground text-xs">/ session</span>
        </p>
        <div className="mt-2.5 pt-2.5 border-t">
          <Link href={`/profile/${trainer.id}`}>
            <Button variant="outline" size="sm" className="w-full rounded-xl h-8 text-xs font-semibold" data-testid={`button-view-profile-${trainer.id}`}>
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
