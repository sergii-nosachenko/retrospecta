'use client';

import { memo, useCallback } from 'react';

import {
  DatePickerContent,
  DatePickerContext,
  DatePickerControl,
  DatePickerInput,
  DatePickerNextTrigger,
  DatePickerPrevTrigger,
  DatePickerRangeText,
  DatePickerRoot,
  DatePickerTable,
  DatePickerTableBody,
  DatePickerTableCell,
  DatePickerTableCellTrigger,
  DatePickerTableHead,
  DatePickerTableHeader,
  DatePickerTableRow,
  DatePickerTrigger,
  DatePickerView,
  DatePickerViewControl,
  DatePickerViewTrigger,
  parseDate,
} from '@/components/ui/date-picker';

interface DateRangeFilterProps {
  dateFrom: string | null;
  dateTo: string | null;
  onDateFromChange: (date: string | null) => void;
  onDateToChange: (date: string | null) => void;
}

interface SingleDatePickerProps {
  value: string | null;
  onChange: (date: string | null) => void;
  placeholder: string;
}

const DatePickerCalendarView = memo(() => (
  <DatePickerView view="day">
    <DatePickerContext>
      {(api) => (
        <>
          <DatePickerViewControl
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <DatePickerPrevTrigger />
            <DatePickerViewTrigger>
              <DatePickerRangeText />
            </DatePickerViewTrigger>
            <DatePickerNextTrigger />
          </DatePickerViewControl>
          <DatePickerTable>
            <DatePickerTableHead>
              <DatePickerTableRow>
                {api.weekDays.map((day, i) => (
                  <DatePickerTableHeader key={i}>
                    {day.short}
                  </DatePickerTableHeader>
                ))}
              </DatePickerTableRow>
            </DatePickerTableHead>
            <DatePickerTableBody>
              {api.weeks.map((week, i) => (
                <DatePickerTableRow key={i}>
                  {week.map((day, j) => {
                    const isCurrentMonth =
                      day.month === api.focusedValue.month &&
                      day.year === api.focusedValue.year;
                    return (
                      <DatePickerTableCell key={j} value={day}>
                        <DatePickerTableCellTrigger
                          style={{
                            opacity: isCurrentMonth ? 1 : 0.4,
                          }}
                        >
                          {day.day}
                        </DatePickerTableCellTrigger>
                      </DatePickerTableCell>
                    );
                  })}
                </DatePickerTableRow>
              ))}
            </DatePickerTableBody>
          </DatePickerTable>
        </>
      )}
    </DatePickerContext>
  </DatePickerView>
));

DatePickerCalendarView.displayName = 'DatePickerCalendarView';

const SingleDatePicker = memo(
  ({ value, onChange, placeholder }: SingleDatePickerProps) => {
    const handleValueChange = useCallback(
      (event: { value: Array<{ toString: () => string }> }) => {
        const dateValue = event.value[0];
        onChange(dateValue ? dateValue.toString() : null);
      },
      [onChange]
    );

    return (
      <DatePickerRoot
        key={value || `${placeholder}-empty`}
        value={value ? [parseDate(value)] : undefined}
        onValueChange={handleValueChange}
        size="sm"
        style={{ alignSelf: 'center' }}
      >
        <DatePickerControl
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1px',
          }}
        >
          <DatePickerInput
            placeholder={placeholder}
            style={{
              width: '140px',
              paddingLeft: '0.75rem',
              paddingRight: '0.75rem',
              height: '36px',
              fontSize: '0.875rem',
            }}
          />
          <DatePickerTrigger />
        </DatePickerControl>
        <DatePickerContent>
          <DatePickerCalendarView />
        </DatePickerContent>
      </DatePickerRoot>
    );
  }
);

SingleDatePicker.displayName = 'SingleDatePicker';

export const DateRangeFilter = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangeFilterProps) => {
  return (
    <>
      <SingleDatePicker
        value={dateFrom}
        onChange={onDateFromChange}
        placeholder="From date"
      />
      <SingleDatePicker
        value={dateTo}
        onChange={onDateToChange}
        placeholder="To date"
      />
    </>
  );
};

DateRangeFilter.displayName = 'DateRangeFilter';
