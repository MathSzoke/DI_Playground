import React from "react";
import { Text, makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        maxWidth: "900px"
    },
    subtitle: {
        opacity: 0.85
    },
    description: {
        lineHeight: "1.6",
        opacity: 0.9
    }
});

export default function Header() {
    const s = useStyles();

    return (
        <div className={s.root}>
            <Text align="center" as="h1" size={900} weight="semibold">
                Dependency Injection
            </Text>

            <Text align="center" as="h2" size={500} className={s.subtitle}>
                with visual feedback
            </Text>

            <Text as="p" size={400} className={s.description}>
                Dependency Injection (DI) is a design pattern that removes the responsibility of creating dependencies from a class and delegates it to an external container.
                Instead of tightly coupling objects together, DI allows dependencies to be provided at runtime, improving testability, flexibility, and maintainability.
                <br /><br />
                Each dependency lifetime behaves differently during application execution. To understand how Transient, Scoped, and Singleton lifetimes work in practice,
                click on the information icons (“i”) below and observe how instances are created and shared across requests in real time.
            </Text>
        </div>
    );
}