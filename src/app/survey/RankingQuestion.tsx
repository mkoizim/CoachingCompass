'use client';

import { useFieldArray, Control } from 'react-hook-form';
import { FormItem, FormLabel, FormControl, FormMessage, useFormField } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, X } from 'lucide-react';

interface RankingQuestionProps {
  control: Control<any>;
  name: string;
  label: string;
  options: string[];
}

export function RankingQuestion({ control, name, label, options }: RankingQuestionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });
  const { error } = useFormField();

  const handleSelect = (value: string) => {
    if (fields.some((field: any) => field.value === value)) return;
    append({ value });
  };

  const getAvailableOptions = () => {
    const selectedValues = fields.map((field: any) => field.value);
    return options.filter((option) => !selectedValues.includes(option));
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <CardDescription>You can omit any option you don't like at all.</CardDescription>
      <Card className="bg-muted/50 p-4">
        <CardContent className="space-y-2 p-0">
          {fields.map((field: any, index) => (
            <div
              key={field.id}
              className="flex items-center gap-4 bg-background p-2 rounded-md border"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                {index + 1}
              </div>
              <p className="flex-grow">{field.value}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {fields.length < options.length && (
            <Select onValueChange={handleSelect} value="">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={`Select your #${fields.length + 1} choice...`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {getAvailableOptions().map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {fields.length === options.length && (
            <CardDescription className="text-center p-2">All options ranked!</CardDescription>
          )}
        </CardContent>
      </Card>
      <FormMessage />
    </FormItem>
  );
}
