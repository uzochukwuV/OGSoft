'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import {toast} from "sonner"
import { Loader2 } from 'lucide-react';

const agentFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }).max(500),
  type: z.enum(['assistant', 'creative', 'analytical', 'specialized']),
  price: z.number().min(0, { message: 'Price must be a positive number' }),
  baseModel: z.string().min(1, { message: 'Base model is required' }),
  parameters: z.string().optional(),
  capabilities: z.string().min(5, { message: 'Capabilities must be at least 5 characters' }),
  verificationMode: z.enum(['none', 'basic', 'advanced']),
  isPublic: z.boolean(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

export function AIAgentCreationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'assistant',
      price: 5,
      baseModel: 'gpt-4',
      parameters: '',
      capabilities: '',
      verificationMode: 'basic',
      isPublic: true,
    },
  });

  async function onSubmit(values: AgentFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ai-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create AI agent');
      }
      
      toast.success('AI agent created successfully');	
      
      router.push(`/ai-marketplace/${data.id}`);
    } catch (error) {
      console.error('Error creating AI agent:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create AI agent');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create AI Agent</CardTitle>
        <CardDescription>
          Create your own AI agent as an INFT on the 0G network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="My AI Assistant" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for your AI agent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="This AI agent helps with..." 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe what your AI agent does and its capabilities
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select agent type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="assistant">Assistant</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="analytical">Analytical</SelectItem>
                        <SelectItem value="specialized">Specialized</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The primary function of your AI agent
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (0G Tokens)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        step={1} 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Set the price in 0G tokens
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="baseModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Model</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select base model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                      <SelectItem value="llama-3">Llama 3</SelectItem>
                      <SelectItem value="mistral-large">Mistral Large</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The foundation model for your AI agent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="parameters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parameters (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder='{\temperature\": 0.7, \"top_p\": 0.9}'
                      {...field} 
                      rows={2}
                    />
                  </FormControl>
                  <FormDescription>
                    JSON format parameters for model configuration
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="capabilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capabilities</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Text generation, code assistance, data analysis..." 
                      {...field} 
                      rows={2}
                    />
                  </FormControl>
                  <FormDescription>
                    List the key capabilities of your AI agent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="verificationMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Mode</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How responses from this agent should be verified
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      List on Marketplace
                    </FormLabel>
                    <FormDescription>
                      Make your AI agent available for purchase on the marketplace
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create AI Agent'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}