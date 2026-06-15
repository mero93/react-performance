import type { Country } from '../../types';
import { CountryCard } from '../country-card/country-card';
import { getPopulationForYear, createYearDataMap } from '../../utils/data-transformers';

import styles from './country-list.module.css';
import { useMemo } from 'react';
import { List, type RowComponentProps } from 'react-window';

type CountryListProps = {
  countries: Country[];
  searchQuery: string;
  selectedColumns: string[];
  selectedRegion: string;
  selectedYear: number;
  sortField: 'name' | 'population';
  sortOrder: 'asc' | 'desc';
};

type CountryRowProps = {
  filteredCountries: Country[];
  selectedYear: number;
  selectedColumns: string[];
};

const CountryRow = ({
  index,
  style,
  filteredCountries,
  selectedYear,
  selectedColumns,
}: RowComponentProps<CountryRowProps>) => {
  const country = filteredCountries[index];
  if (!country) {
    return null;
  }

  return (
    <div style={style} className={styles.rowWrapper}>
      <CountryCard
        country={country}
        selectedYear={selectedYear}
        selectedColumns={selectedColumns}
      />
    </div>
  );
};

export const CountryList = ({
  countries,
  searchQuery,
  selectedColumns,
  selectedRegion,
  selectedYear,
  sortField,
  sortOrder,
}: CountryListProps) => {
  const filteredCountries = useMemo(() => {
    return countries
      .filter((c) => {
        const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRegion = !selectedRegion || c.data.some((d) => d.region === selectedRegion);
        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        if (sortField === 'name') {
          return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
        } else {
          const popA = getPopulationForYear(createYearDataMap(a.data), selectedYear) || 0;
          const popB = getPopulationForYear(createYearDataMap(b.data), selectedYear) || 0;
          return sortOrder === 'asc' ? popA - popB : popB - popA;
        }
      });
  }, [countries, searchQuery, selectedRegion, selectedYear, sortField, sortOrder]);

  const sharedRowProps = useMemo(
    (): CountryRowProps => ({
      filteredCountries,
      selectedYear,
      selectedColumns,
    }),
    [filteredCountries, selectedYear, selectedColumns]
  );

  if (filteredCountries.length === 0) {
    return <div className={styles.noResults}>No countries match your search parameters.</div>;
  }

  return (
    <div className={styles.countryList}>
      <List<CountryRowProps>
        rowCount={filteredCountries.length}
        rowHeight={220}
        rowComponent={CountryRow}
        rowProps={sharedRowProps}
        style={{ height: 600, width: '100%' }}
      />
    </div>
  );
};
