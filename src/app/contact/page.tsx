"use client";

import { Button } from "@/components/ui/button";
import {
	Description,
	Field,
	FieldGroup,
	Fieldset,
	Label,
} from "@/components/ui/fieldset";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { submitContactRequest } from "./submit-contact-request";
import { Listbox, ListboxLabel, ListboxOption } from "@/components/ui/listbox";
import PageHeading from "@/components/PageHeading";
import { Text } from "@/components/ui/text";
import { authClient } from "@/auth.client";

export default function ContactPage() {
	const formRef = useRef<HTMLFormElement>(null);
	const [messageType, setMessageType] = useState<string>("general");
	const [submissionState, setSubmissionState] = useState<
		"idle" | "loading" | "success" | "error" | "email-error"
	>("idle");
	const [message, setMessage] = useState("");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(true);

	const { data, isPending } = authClient.useSession();

	useEffect(() => {
		if (isPending) return;

		setLoading(false);
		if (!data) return;

		setName(data.user.name);
		setEmail(data.user.email);
	}, [isPending, data]);

	if (loading) {
		return (
			<div>
				<PageHeading
					title="Contact us"
					description="Have a question, message or suggestion? We’d love to hear from you!"
				/>
				<Text>Loading...</Text>
			</div>
		);
	}

	return (
		<div>
			<PageHeading
				title="Contact us"
				description="Have a question, message or suggestion? We’d love to hear from you!"
			/>
			<form
				className="my-8"
				ref={formRef}
				onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
					e.preventDefault();

					toast.promise(
						new Promise((resolve, reject) => {
							setSubmissionState("loading");
							setTimeout(async () => {
								const { success, error } = await submitContactRequest({
									message: message,
									email: email,
									name: name,
									type: messageType,
								});

								if (error && !success) {
									setSubmissionState("error");
									return reject(new Error(error));
								}

								setSubmissionState("success");
								return resolve(true);
							}, 500);
						}),
						{
							loading: "Sending message...",
							success: "Awesome! We’ll get back to you soon! 🎉",
							error: (error) =>
								`Error: ${error.message}`.replace("Error: Error: ", ""),
						},
					);
				}}
			>
				<Fieldset>
					<FieldGroup>
						<Field>
							<Label>Message Type</Label>
							<Listbox
								name="type"
								defaultValue="general"
								value={messageType}
								onChange={setMessageType}
								disabled={submissionState === "loading"}
							>
								<ListboxOption value="general">
									<ListboxLabel>General Enquiries</ListboxLabel>
								</ListboxOption>
								<ListboxOption value="feature">
									<ListboxLabel>Feature Request</ListboxLabel>
								</ListboxOption>
								<ListboxOption value="bug">
									<ListboxLabel>Bug Report</ListboxLabel>
								</ListboxOption>
								<ListboxOption value="other">
									<ListboxLabel>Other</ListboxLabel>
								</ListboxOption>
							</Listbox>
							<Description>What kind of message can we expect?</Description>
						</Field>
						<Field>
							<Label>Your name</Label>
							<Input
								required
								name="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								disabled={submissionState === "loading"}
							/>
							<Description>So we know who you are.</Description>
						</Field>
						<Field>
							<Label>Your Email</Label>
							<Input
								type="email"
								required
								name="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={submissionState === "loading"}
							/>
							<Description>So we can get back to you.</Description>
						</Field>
						<Field>
							<Label>Your Message</Label>
							<Textarea
								required
								name="message"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								disabled={submissionState === "loading"}
							/>
							<Description>What would you like to say?</Description>
						</Field>
						<Field>
							<Button
								type="submit"
								disabled={
									submissionState === "loading" || !message || !name || !email
								}
							>
								Send Message
							</Button>
						</Field>
					</FieldGroup>
				</Fieldset>
			</form>
		</div>
	);
}
