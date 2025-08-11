import { createFileRoute } from '@tanstack/react-router';
import { List, Section } from '@telegram-apps/telegram-ui';
import { ThemeDemo } from '../components/ThemeDemo';
import { ThemeUsageExamples } from '../components/ThemeUsageExamples';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <List className="p-2">
      <Section>
        <h1>Welcome Home!</h1>
      </Section>

      <ThemeDemo />
      <ThemeUsageExamples />

      <Section>
        <h2>Typography Examples</h2>
        <h1>Hello World</h1>
        <h2>Hello World</h2>
        <h3>Hello World</h3>
        <h4>Hello World</h4>
        <h5>Hello World</h5>
        <h6>Hello World</h6>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          quos. Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing
          elit. Quisquam, quos.
        </p>
      </Section>
    </List>
  );
}
