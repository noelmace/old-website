import React from 'react';
import _ from 'lodash';
import moment from 'moment-strftime';

import { graphql } from 'gatsby';
import { Layout } from '../components/index';
import { RichText } from 'prismic-reactjs';

/*
 * TODO: remove this lame siteMetadata workaround
 *
 * gatsby-source-prismic-graphql has its own createPages
 * The Layout generated by Stackbit requires the siteMetadata
 * but those are passed by createPages in gatsby-node.
 * I need to investigate more further what and how Stackbit
 * could update in order to refact this.
 */
export const query = graphql`
  query TalkQuery($uid: String) {
    prismic {
      allTalks(uid: $uid) {
        edges {
          node {
            abstract {
              ... on PRISMIC_Abstract {
                title
                body
                description
                type
              }
            }
            date
            event_name
            event_url {
              ... on PRISMIC__ExternalLink {
                url
              }
            }
            slides {
              ... on PRISMIC__ExternalLink {
                url
              }
            }
            video {
              ... on PRISMIC__ExternalLink {
                url
              }
            }
          }
        }
      }
    }
    site {
      siteMetadata {
        layout_style
        palette
        header {
          title
          tagline
          profile_img
          bg
          has_nav
          has_social
        }
        footer {
          content
          links {
            text
            url
            new_window
          }
        }
        title
      }
    }
  }
`;

const Talk = ({ talk }) => {
  if (!talk) return null;
  console.log(talk);
  return (
    <article className="post post-full">
      <header className="post-header">
        <h1 className="post-title underline">
          {RichText.asText(talk.node.event_name)}
          <a href={talk.node.event_url.url} target="_blank" rel="noopener noreferrer">
            <img src="/icons/open_in_new.svg" className="event-link" alt="open event website" />
          </a>
        </h1>
        {_.get(talk, 'node.abstract.title') && <div className="post-subtitle">{RichText.asText(talk.node.abstract.title)}</div>}
      </header>
      <div className="post-content">
        <time
          dateTime={moment(_.get(talk, 'node.date')).strftime('%Y-%m-%d %H:%M')}
          className={moment().isBefore(talk.node.date) ? 'upcoming' : 'past'}
        >
          {moment(_.get(talk, 'node.date')).strftime('%B %d, %Y - %H:%M')}
        </time>
        <div className="talk-type">{talk.node.abstract.type}</div>
        {_.get(talk, 'node.abstract.description') && (
          <div className="talk-description">{RichText.asText(talk.node.abstract.description)}</div>
        )}
        <p className="block-cta">
          {_.get(talk, 'node.video.url') && (
            <a className="button" href={talk.node.video.url} target="_blank" rel="noopener noreferrer">
              Video
            </a>
          )}
          {_.get(talk, 'node.slides.url') && (
            <a className="button" href={talk.node.slides.url} target="_blank" rel="noopener noreferrer">
              Slides
            </a>
          )}
        </p>
        {_.get(talk, 'node.abstract.body') && RichText.render(talk.node.abstract.body)}
      </div>
    </article>
  );
};

export default class extends React.Component {
  render() {
    const { data, ...props } = this.props;
    const talk = data.prismic.allTalks.edges.slice(0, 1).pop();
    props.pageContext.site = data.site;
    return (
      <Layout {...this.props}>
        <Talk talk={talk} />
      </Layout>
    );
  }
}
