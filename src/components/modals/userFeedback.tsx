'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { MessageSquareText } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import FeedbackService from '~/app/api/services/feedback-service'
import useWindowWidth from '~/hooks/dashboard/useWindowWidth'
import { POSTHOG_EVENT_NAMES, sendPosthogEvent } from '~/lib/posthog'
import { UserRatingSchema } from '~/schemas'
import { cn } from '~/utils'
import { GOOGLE_FEEDBACK_FORM_URL } from '~/utils/constant'
import { SuccessIcon } from '../logo/logo'
import SelectInput from '../shared/select-input'
import { Button } from '../ui/button'
import { Dialog, DialogContent } from '../ui/dialog'
import { Drawer, DrawerContent } from '../ui/drawer'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import StarRating from '../ui/star-rating'
import { Textarea } from '../ui/textarea'

function UserFeedback() {
  const window = useWindowWidth()
  const [open, setOpen] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleSubmit = async (values: z.infer<typeof UserRatingSchema>) => {
    const feedbackService = new FeedbackService()
    await feedbackService.sendUserFeedback(values)
    setFeedbackSubmitted(true)
    form.reset()
  }

  const form = useForm<z.infer<typeof UserRatingSchema>>({
    defaultValues: {
      rating: 0,
      feedback_selection: '',
      description: '',
    },
    resolver: zodResolver(UserRatingSchema),
  })

  const { isDirty, isSubmitting } = form.formState

  if (window > 640) {
    return (
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value)
          if (!value) {
            form.reset()
          }
        }}
      >
        <a
          className="w-full"
          onClick={() =>
            sendPosthogEvent(POSTHOG_EVENT_NAMES.FEEDBACK_CLICK, null)
          }
          target="_blank"
          href={GOOGLE_FEEDBACK_FORM_URL}
        >
          <Button
            variant="secondary"
            icon={MessageSquareText}
            iconSize={20}
            className="w-full px-3.5 py-2"
            containerClass="w-[90%] mx-auto"
          >
            <span>Give feedback</span>
          </Button>
        </a>
        <DialogContent className="mx-auto max-w-[600px] p-6">
          {!feedbackSubmitted ? (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <h2 className="text-display-xs font-medium text-neutral-800">
                  We value your feedback
                </h2>
                <p className="max-w-[456px] text-neutral-500">
                  Help us improve by sharing your thoughts. Your feedback makes
                  a difference!
                </p>
              </div>
              <Form {...form}>
                <form
                  className="flex flex-col gap-6"
                  onSubmit={form.handleSubmit(handleSubmit)}
                >
                  <div className="flex flex-col gap-5">
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Rate your experience
                          </FormLabel>
                          <FormControl>
                            <StarRating
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="feedback_selection"
                      render={({ field, formState }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            What type of feedback are you sharing?
                          </FormLabel>
                          <FormControl>
                            <SelectInput
                              options={[
                                { value: 'Bug report', label: 'Bug report' },
                                {
                                  value: 'Feature suggestion',
                                  label: 'Feature suggestion',
                                },
                                {
                                  value: 'General feedback',
                                  label: 'General feedback',
                                },
                              ]}
                              value={field.value || ''}
                              onChange={field.onChange}
                              placeholder="Select an option"
                              className={cn(
                                'w-full rounded-lg border px-[14px] py-[10px] text-sm outline-none focus:border-0 focus:ring-2',
                                formState.errors.feedback_selection
                                  ? 'border-error-600 focus:ring-error-600'
                                  : 'focus:ring-secondary-25 border-neutral-300'
                              )}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field, formState }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Tell us more
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={4}
                              placeholder="Share any details that would help us improve..."
                              className={cn(
                                'w-full resize-none rounded-lg border px-[14px] py-[10px] text-sm outline-none focus:border-0 focus:ring-2',
                                formState.errors.description
                                  ? 'border-error-600 focus:ring-error-600'
                                  : 'focus:ring-secondary-25 border-neutral-300'
                              )}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mt-0 flex items-center gap-3">
                    <Button
                      onClick={() => setOpen(false)}
                      variant="secondary"
                      className="w-full px-[18px] py-2.5"
                      containerClass="w-full"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full px-[18px] py-2.5"
                      containerClass="w-full"
                      disabled={!isDirty}
                      isLoading={isSubmitting}
                    >
                      Submit
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          ) : (
            <FeedbackConfirmation
              setOpen={setOpen}
              setFeedbackSubmitted={setFeedbackSubmitted}
            />
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={(value: boolean) => setOpen(value)}>
      <a
        href={GOOGLE_FEEDBACK_FORM_URL}
        className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-lg border border-neutral-100 bg-white px-3.5 py-2 text-sm font-medium text-primary transition-all duration-200 ease-in-out hover:border-neutral-600 hover:bg-neutral-600 hover:text-white"
        onClick={() =>
          sendPosthogEvent(POSTHOG_EVENT_NAMES.FEEDBACK_CLICK, null)
        }
        target="_blank"
      >
        <MessageSquareText size={20} />
        <span>Give feedback</span>
      </a>
      <DrawerContent>
        {!feedbackSubmitted ? (
          <div className="flex flex-col gap-6 px-4 pb-8 pt-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-medium text-neutral-800">
                We value your Feedback
              </h2>
              <p className="max-w-[456px] text-sm text-neutral-500">
                Help us improve by sharing your thoughts. Your feedback makes a
                difference!
              </p>
            </div>
            <Form {...form}>
              <form
                className="flex flex-col gap-6"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <div className="flex flex-col gap-6">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          How was your experience
                        </FormLabel>
                        <FormControl>
                          <StarRating
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="feedback_selection"
                    render={({ field, formState }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          What type of feedback are you sharing?
                        </FormLabel>
                        <FormControl>
                          <SelectInput
                            options={[
                              { value: 'Bug report', label: 'Bug report' },
                              {
                                value: 'Feature suggestion',
                                label: 'Feature suggestion',
                              },
                              {
                                value: 'General feedback',
                                label: 'General feedback',
                              },
                            ]}
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Select an option"
                            className={cn(
                              'w-full rounded-lg border px-[14px] py-[10px] outline-none focus:border-0 focus:ring-2',
                              formState.errors.feedback_selection
                                ? 'border-error-600 focus:ring-error-600'
                                : 'focus:ring-secondary-25 border-neutral-300'
                            )}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field, formState }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Tell us more
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            placeholder="Share any details that would help us improve..."
                            className={cn(
                              'w-full resize-none rounded-lg border px-[14px] py-[10px] outline-none focus:border-0 focus:ring-2',
                              formState.errors.description
                                ? 'border-error-600 focus:ring-error-600'
                                : 'focus:ring-secondary-25 border-neutral-300'
                            )}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col-reverse gap-4 p-0">
                  <Button
                    onClick={() => setOpen(false)}
                    variant="secondary"
                    className="w-full px-[18px] py-2.5"
                    containerClass="w-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full px-[18px] py-2.5"
                    containerClass="w-full"
                    disabled={!isDirty}
                    isLoading={isSubmitting}
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        ) : (
          <FeedbackConfirmation
            setOpen={setOpen}
            setFeedbackSubmitted={setFeedbackSubmitted}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

export default UserFeedback

const FeedbackConfirmation = ({
  setOpen,
  setFeedbackSubmitted,
}: {
  setOpen: (value: boolean) => void
  setFeedbackSubmitted: (value: boolean) => void
}) => {
  const closeFeedbackForm = (value: boolean) => {
    setOpen(value)
    setFeedbackSubmitted(value)
  }
  return (
    <div className="px-6 py-8">
      <div className="gap-4.5 flex flex-col items-center">
        <SuccessIcon />
        <p className="mx-auto max-w-[348px] text-center text-neutral-500">
          Thanks for your feedback! We appreciate your input and will review it
          soon.
        </p>
      </div>
      <Button
        onClick={() => closeFeedbackForm(false)}
        variant="secondary"
        className="px-4.5 w-full py-2.5"
        containerClass="w-full mt-10 lg:mt-8"
      >
        <span className="font-medium">Close</span>
      </Button>
    </div>
  )
}
