"use client";

import Link from "next/link";
import { useEffect, useRef, useState, Suspense, useMemo } from "react";
import { usePathname } from 'next/navigation';
import Loading from "./loading";
import FadeInImage from "./FadeInImage";
import { Hero } from "#/graphql/generated/types";
import { useHeroes } from './GetHeroesProvider';

export default function HeroList() {
  const { data } = useHeroes();
  const heroes = useMemo(() => {
    const sortedItems = [...data?.heroes?.nodes ?? []].sort((a, b) => {          
      const rarityA = a.heroInformation?.bioFields?.rarity?.toString().toLowerCase() ?? '';
      const rarityB = b.heroInformation?.bioFields?.rarity?.toString().toLowerCase() ?? '';
      if (rarityA < rarityB) return 1;
      if (rarityA > rarityB) return -1;
      // Sort by title within each rarity
      const titleA = a.title?.toLowerCase() || '';
      const titleB = b.title?.toLowerCase() || '';
      if (rarityA === rarityB) {
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      }
      
      return 0;
    });
    return sortedItems as Hero[];
  }, [data]);
  const heroesRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();  
  const [activeHero, setActiveHero] = useState<string | null>(null);

  useEffect(() => {
    if (!heroes.length || !heroesRef.current) return;
    const element = heroesRef.current[pathname + "/"];
    if (element && containerRef.current) {
      const offset = 100; // Adjust this value to control the scroll offset
      const elementRect = element.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const scrollTop = containerRef.current.scrollTop;
      const offsetPosition = elementRect.top - containerRect.top + scrollTop - offset;

      containerRef.current.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveHero(pathname + "/");
    }
  }, [pathname, heroes]);

  if (!heroes.length) {
    return null;
  }

  return (
    <Suspense fallback={<Loading />}>
      <div ref={containerRef} className="w-full pt-4 pb-4 overflow-y-auto scrollbar-none h-full">
        {heroes.map((hero: Hero) => (
          <div
            key={hero.uri}
            ref={(el) => { heroesRef.current[hero.uri ?? ""] = el; }} 
            data-sort data-name={hero.heroInformation?.bioFields?.name} data-title={hero.title} data-element={hero.heroInformation?.bioFields?.element} data-rarity={hero.heroInformation?.bioFields?.rarity} data-party-buff={hero.heroInformation?.abilityFields?.partyBuff?.[0]?.stat || 'none'} 
            data-filter={`${hero.heroInformation?.bioFields?.element?.toLowerCase()} ${hero.heroInformation?.bioFields?.role?.toLowerCase()} r-${hero.heroInformation?.bioFields?.rarity?.toString().replace(/ /g, "-").toLowerCase()} ${hero.heroInformation?.abilityFields?.partyBuff?.map(buff => buff?.affectsParty ? buff?.stat?.toString()
              .replaceAll(/ /g, "-")
              .replaceAll('[]','')
              .replaceAll(',','')
              .replaceAll('--','-')      
              .toLowerCase()
              .replaceAll('x%','x')
              .replaceAll('%', '')
              .replace('when-a-shield-is-present-damage-dealt-increases-by-x-while-damage-taken-decreases-by-x','shield-damage')
              .replace('decrease-damage-taken-by-of-increased-skill-damage','skill-damage-decreased-damage-taken') : '').join(' ')}`.trim()}
            className={`${hero.heroInformation?.abilityFields?.partyBuff?.map(buff => buff?.affectsParty ? buff?.stat?.toString()
              .replaceAll(/ /g, "-")
              .replaceAll('[]','')
              .replaceAll(',','')
              .replaceAll('--','-')      
              .toLowerCase()
              .replaceAll('x%','x')
              .replaceAll('%', '')
              .replace('when-a-shield-is-present-damage-dealt-increases-by-x-while-damage-taken-decreases-by-x','shield-damage')
              .replace('decrease-damage-taken-by-of-increased-skill-damage','skill-damage-decreased-damage-taken') : '').join(' ')} ${"e-" + hero.heroInformation?.bioFields?.element?.toLowerCase()} ${hero.heroInformation?.bioFields?.element?.toLowerCase()} r-${hero.heroInformation?.bioFields?.rarity?.toString().replace(/ /g, "-").toLowerCase()} ${hero.heroInformation?.bioFields?.role?.toLowerCase()} pt-4 pb-4 pl-8 pr-8 card ${
              activeHero === hero.uri ? 'bg-gray-800 text-gray-300' : 'text-gray-400 hover:bg-gray-900'
            }`}
          >
            <Link href={`${hero.uri}`} className={"w-full"}>
              <h3 className="flex items-center">
                <FadeInImage
                  src={
                    hero.heroInformation?.thumbnail?.node.sourceUrl
                      ? hero.heroInformation?.thumbnail?.node.sourceUrl + ""
                      : "https://api.heavenhold.com/wp-content/uploads/2020/08/1starf-150x150.jpg"
                  }
                  className={`w-16 h-16 aspect-square object-cover bg-gradient-to-b border-b-4 ${
                    (hero?.heroInformation?.bioFields?.rarity?.toString() == '3 Star') ? `from-yellow-700 to-yellow-500 border-b-4 border-yellow-500` : (hero?.heroInformation?.bioFields?.rarity?.toString() == '2 Star' ? `from-gray-600 to-gray-400 border-b-4 border-gray-400` : `from-amber-800 to-amber-600 border-b-4 border-amber-600`)
                  }`} 
                  width={100}
                  height={100}
                  alt={hero.title + ""}
                />
                <span className="flex items-center pl-4 text-xs xl:text-sm font-medium w-[calc(100%-4rem)]">{hero.title}</span>
              </h3>
            </Link>
          </div>
        ))}
      </div>
    </Suspense>
  );
}
