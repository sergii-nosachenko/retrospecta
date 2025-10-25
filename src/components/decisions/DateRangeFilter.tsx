'use client';

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

export function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangeFilterProps) {
  return (
    <>
      {/* Date From Filter */}
      <DatePickerRoot
        key={dateFrom || 'from-empty'}
        value={dateFrom ? [parseDate(dateFrom)] : undefined}
        onValueChange={(e) => {
          const dateValue = e.value[0];
          onDateFromChange(dateValue ? dateValue.toString() : null);
        }}
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
            placeholder="From date"
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
        </DatePickerContent>
      </DatePickerRoot>

      {/* Date To Filter */}
      <DatePickerRoot
        key={dateTo || 'to-empty'}
        value={dateTo ? [parseDate(dateTo)] : undefined}
        onValueChange={(e) => {
          const dateValue = e.value[0];
          onDateToChange(dateValue ? dateValue.toString() : null);
        }}
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
            placeholder="To date"
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
        </DatePickerContent>
      </DatePickerRoot>
    </>
  );
}
