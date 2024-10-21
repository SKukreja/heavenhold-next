"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import Loading from "./loading";
import ItemCard from "./ItemCard";
import FadeInImage from "./FadeInImage"; 
import { Item } from "#/graphql/generated/types";
import { useItems } from './GetItemsProvider';

export default function ItemGrid() {
  const { data } = useItems();

  const items = useMemo(() => {
    const sortedItems = [...(data?.items?.nodes ?? [])] as Item[];
    sortedItems.sort((a: Item, b: Item) => {
      const aName = a.title || '';
      const bName = b.title || '';
      return aName.localeCompare(bName);
    });
    return sortedItems;
  }, [data]);

  if (!items.length) {
    return null;
  }

  return (
    <Suspense fallback={<Loading />}>
      <div id="HeroList" className="flex flex-wrap justify-center gap-4 lg:gap-8 lg:p-4">
        {items.map((item: Item, index: number) => (
          <ItemLink key={item.uri} item={item} index={index} />
        ))}
      </div>
    </Suspense>
  );
}

const ItemLink = ({ item, index }: { item: Item, index: number }) => {
  const element = item?.equipmentOptions?.mainStats?.find((x) => x?.stat?.includes("Fire") || x?.stat?.includes("Earth") || x?.stat?.includes("Water") || x?.stat?.includes("Light") || x?.stat?.includes("Dark") || x?.stat?.includes("Basic"))?.stat?.toString().replace(" Atk", "");
  return (
    <Link
      href={item.uri ?? '/'}
      data-filter={`${item.title} r-${item?.itemInformation?.rarity?.toString().replace(/ /g, "-").toLowerCase()}`}
      className={`${"e-" + element} r-${item?.itemInformation?.rarity?.toString().replace(/ /g, "-").toLowerCase()} relative w-[calc(50vw-2rem)] lg:w-[calc(30%-2rem)] flex m-0 lg:m-[10px] cursor-pointer align-middle transition-all duration-200 after:transition-all after:linear after:duration-200 hover:after:outline-offset-[-5px] ease grayscale-[30%] hover:grayscale-0 after:w-full after:h-full after:absolute after:inset-0 after:z-20 after:pointer-events-none after:border after:border-gray-800 after:outline after:outline-2 p-8`}
    >
      <ItemCard item={item} element={element} index={index} />
    </Link>
  );
}