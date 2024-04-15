import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {z} from "zod";
import { authSchema } from "@/validators/auth";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { IUser } from "@/types/user.type";
 

type AuthFormProps = {
  handleLoginSubmit: (user: IUser) => void
  submitLabel: string
}

export function AuthForm({handleLoginSubmit, submitLabel} : AuthFormProps) {
    // 1. Define your form.
    const form = useForm<z.infer<typeof authSchema>>({
      resolver: zodResolver(authSchema),
      defaultValues: {
        email: "",
        password: ""
      },
    })

    
   
    // 2. Define a submit handler.
    const  onSubmit = (values: z.infer<typeof authSchema>) => {
      // Do something with the form values.
      // ✅ This will be type-safe and validated.
      handleLoginSubmit(values)
      console.log(values)
    }



    return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-3 rounded-md bg-primary h-min w-80">
            <h1 className="font-bold text-3xl text-white">{submitLabel}</h1>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">email</FormLabel>
                  <FormControl>
                    <Input placeholder="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="bg-foreground hover:bg-secondary-foreground" >{submitLabel}</Button>
          </form>
        </Form>
      )
  }