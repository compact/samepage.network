import React, { useMemo } from "react";
import type { Annotation, Schema } from "../types";

type AnnotationTree = (Annotation & { children: AnnotationTree })[];

const AnnotationRendered = ({
  annotation,
  content,
}: {
  annotation: AnnotationTree[number];
  content: string;
}): React.ReactElement => {
  const children = annotation.children
    .reduce(
      (p, c, index) => {
        const splitIndex = p.findIndex(
          (pp) => pp.start <= c.start && c.end <= pp.end
        );
        return [
          ...p.slice(0, splitIndex),
          ...[
            {
              el: content.slice(p[splitIndex].start, c.start),
              start: p[splitIndex].start,
              end: c.start,
            },
            {
              el: (
                <AnnotationRendered
                  annotation={c}
                  content={content}
                  key={index}
                />
              ),
              start: c.start,
              end: c.end,
            },
            {
              el: content.slice(c.end, p[splitIndex].end),
              end: p[splitIndex].end,
              start: c.end,
            },
          ],
          ...p.slice(splitIndex + 1),
        ];
      },
      [
        {
          el: content.slice(annotation.start, annotation.end),
          start: annotation.start,
          end: annotation.end,
        },
      ] as { el: React.ReactNode; start: number; end: number }[]
    )
    .map((c) => c.el);
  return annotation.type === "block" ? (
    <div
      style={{ marginLeft: annotation.attributes.level * 8 }}
      className={"my-2"}
    >
      {children}
    </div>
  ) : annotation.type === "highlighting" ? (
    <span className="bg-yellow-300">{children}</span>
  ) : annotation.type === "bold" ? (
    <b className="font-bold">{children}</b>
  ) : annotation.type === "italics" ? (
    <i className="italics">{children}</i>
  ) : annotation.type === "link" ? (
    <a href={annotation.attributes.href}>{children}</a>
  ) : (
    <>{children}</>
  );
};

const AtJsonRendered = ({ content, annotations }: Schema) => {
  const selectedSnapshotTree = useMemo(() => {
    const tree: AnnotationTree = [];
    annotations.forEach((anno) => {
      const insert = (annotations: AnnotationTree, a: Annotation) => {
        const parent = annotations.find(
          (an) => an.start <= a.start && an.end >= a.end
        );
        if (parent) {
          insert(parent.children, a);
        } else {
          annotations.push({ ...a, children: [] });
        }
      };
      insert(tree, anno);
    });
    return tree;
  }, [annotations]);
  return (
    <>
      {selectedSnapshotTree.map((annotation) => (
        <AnnotationRendered
          annotation={annotation}
          content={content.toString() || ""}
        />
      ))}
    </>
  );
};

export default AtJsonRendered;